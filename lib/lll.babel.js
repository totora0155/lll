import __ from 'lodash';
import es from 'event-stream';
import File from 'vinyl';
import vfs from 'vinyl-fs';
import orderAlign from 'order-align';
import Component from './component';
import Template from './template';
import Cloud from './cloud';
import actions from './actions';
import store from './store';

export default lll;

Object.assign(lll, {Component});

async function lll(/* ...components, opts = {} */) {
  const components = classifyArgs(...arguments);
  const templates = await bundleTemplate(components);
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
  const promises = components.map(component => {
    return component.templates;
  });
  const templateArr = await Promise.all(promises);
  components.forEach((component, idx) => {
    component.templates = templateArr[idx];
    store.dispatch(actions.cacheTemplate(component.templates));
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
          component.cacheCloudTemplates(cloudName);
        }
      });
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
  const templates = components.reduce((result, component) => {
    return result.concat(component.templates);
  }, []);
  return templates;
}
