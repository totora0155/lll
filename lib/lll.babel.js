import path from 'path';
import __ from 'lodash';
import es from 'event-stream';
import File from 'vinyl';
import vfs from 'vinyl-fs';
import orderAlign from 'order-align';
import Component, {createTemplate} from './component';
import Template from './template';
import Cloud from './cloud';
import actions from './actions';
import store from './store';

export default lll;

Object.assign(lll, {Component});

async function lll(/* ...components, opts = {} */) {
  const components = classifyArgs(...arguments);
  // store.dispatch(actions.cacheClear('cloud'));
  const templates = await bundleTemplate(components);
  // debugger;
  // templates.concat(createGlobalCloudTemplates());
  store.dispatch(actions.associate(templates));

  const files =
    __.chain(templates)
      .filter(t => t.isLeaf())
      .filter(t => t.opts.output)
      .map(template => {
        const file = template.render();
        return file;
      })
      .value();
  return es.readArray(files);
}

lll.order = (list, items) => {
  return orderAlign(list, items, 'data.name');
};

lll.dest = destPath => {
  return vfs.dest(destPath);
};

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
  const promises = components.map(component => {
    return component.templates;
  });
  const templateArr = await Promise.all(promises);
  let _cloud = {};
  components.forEach((component, idx) => {
    component.templates = templateArr[idx];
    const key = component.constructor.name.toLowerCase();
    store.dispatch(actions.cacheTemplate(component.templates, key));
  });
  components.forEach((component, idx) => {
    try {
      component.ready();

      _.forEach(component.cloud, (value, cloudName) => {
        if (value.opts) {
          if (value.opts.cloud) {
            if (value.opts.cloud.isolate) {
              return component.createCloudTemplates(cloudName);
            }
          }
        }
        if (value) {
          const cloud = component.cacheCloudTemplates(cloudName, config);
          if (!_cloud[cloudName]) {
            _cloud[cloudName] = cloud
          } else {
            debugger;
            _.forEach(cloud.items, word => {
              const index = _.findIndex(_cloud[cloudName].items, {
                word: word.name
              });
              if (~index) {
                target.items[index].count += word.items.length;
                target.items[index].items.concat(word.items);
              } else {
                target.items.push(word);
              }
            });
          }
        }
      });
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

  // override config
  const cachedTemplate = store.getState()._template;
  let cloudTemplates = [];
  const parent = _.find(cachedTemplate, {name: config.cloud.parent});
  _.forEach(_cloud, (cloud, cloudName) => {
    const templates = [];
    _.forEach(cloud.items, word => {
      word.createFile(parent.contents);
      const template = createTemplate({
        base: word.file.base,
        path: word.file.path,
        contents: new Buffer(word.file.contents),
        data: Object.assign(word.data, {
          title: word.word,
          items: word.items
        }),
        opts: word.opts
      });
      templates.push(template)
    })
    store.dispatch(actions.cacheCloud(templates, cloudName))
    cloudTemplates.push(...templates);
  });

  const templates = components.reduce((result, component) => {
    return result.concat(component.templates);
  }, []);
  return templates.concat(cloudTemplates);
}
