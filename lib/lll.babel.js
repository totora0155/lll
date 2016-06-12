import __ from 'lodash';
import es from 'event-stream';
import vfs from 'vinyl-fs';
import orderAlign from 'order-align';
import Component, {createTemplate} from './component';
import actions from './actions';
import store from './store';
import page from './page';
import {getToken} from './helpers';

export default lll;

Object.assign(lll, {Component});

async function lll(/* ...components, opts = {} */) {
  const components = classifyArgs(...arguments);
  // store.dispatch(actions.cacheClear('cloud'));
  const templates = await bundleTemplate(components);

  store.dispatch(actions.associate(templates));

  page.items = [];
  page.items = __.chain(templates)
                 .filter(t => t.isLeaf())
                 .filter(t => t.opts.output)
                 .value();

  const files = (() => {
    const generator = pageGenerator();
    const result = [];
    let idx = 0;
    while (generator.next().value) {
      const template = page.items[idx];
      result.push(template.render());
      idx++;
    }
    return result;
  })();

  return es.readArray(files);
}

lll.order = (list, items) => {
  return orderAlign(list, items, 'data.name');
};

lll.dest = destPath => {
  return vfs.dest(destPath);
};

function * pageGenerator() {
  return yield * page.items;
}

function classifyArgs(...components) {
  const config = require('./config');
  const last = components[components.length - 1];

  if (!(last instanceof Component) &&
      last instanceof Object) {
    const opts = components.pop();
    Object.assign(config, opts);
  }
  return components;
}

async function bundleTemplate(components) {
  const config = require('./config').default;
  const promises = components.map(component => component.templates);
  const templateArr = await Promise.all(promises);
  const _cloud = {};

  __.forEach(components, (component, idx) => {
    const cached = store.getState().template[component.token];
    const filtered = __.filter(cached, t => t.token === component.token);
    component.templates = templateArr[idx];
    if (component.opts.cache && component.templates.length) {
      // For the second round or later
      if (cached && filtered.length) {
        __.forEach(component.templates, template => {
          const index = __.findIndex(filtered, {name: template.name});
          if (~index) {
            filtered[index] = template;
          } else {
            filtered.push(template);
          }
        });
        component.templates = filtered;
      }
      store.dispatch(actions.cacheTemplate(component));
    } else if (component.opts.cache) {
      component.templates =
        store.getState().template[component.token] || [];
    } else {
      store.dispatch(actions.cacheTemplate(component));
    }
  });

  __.forEach(components, component => {
    try {
      component.ready();
      component.createAtomTemplate();

      __.forEach(component.cloud, (value, cloudName) => {
        if (value.opts) {
          if (value.opts.cloud) {
            if (value.opts.cloud.isolate) {
              return component.createCloudTemplates(cloudName);
            }
          }
        }
        if (value) {
          const cloud = component.cacheCloudTemplates(cloudName, config);
          if (_cloud[cloudName]) {
            __.forEach(cloud.items, word => {
              const target = _cloud[cloudName];
              const index = __.findIndex(target.items, {
                word: word.name
              });
              if (~index) {
                target.items[index].count += word.items.length;
                target.items[index].items.concat(word.items);
              } else {
                target.items.push(word);
              }
            });
          } else {
            _cloud[cloudName] = cloud;
          }
        }
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  // override config
  const cachedTemplate = store.getState()._template;
  const cloudTemplates = [];
  const parent = __.find(cachedTemplate, {name: config.cloud.parent});
  __.forEach(_cloud, (cloud, cloudName) => {
    const token = getToken(`word:${cloudName}`);
    const templates = [];
    __.forEach(cloud.items, word => {
      word.createFile(parent.contents);
      const template = createTemplate({
        base: word.file.base,
        path: word.file.path,
        contents: new Buffer(word.file.contents),
        data: Object.assign(word.data, {
          title: word.word,
          items: word.items
        }),
        opts: word.opts,
        token
      });
      templates.push(template);
    });
    store.dispatch(actions.cacheCloud(templates, cloudName));
    cloudTemplates.push(...templates);
  });

  const templates = components.reduce((result, component) => {
    return result.concat(component.templates);
  }, []);
  return templates.concat(cloudTemplates);
}
