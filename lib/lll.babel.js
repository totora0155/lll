import _ from 'lodash';
import es from 'event-stream';
import vfs from 'vinyl-fs';
import orderAlign from 'order-align';
import Component from './component';
import {store, cacheActions, treeActions} from './tree';
import state from './state';

const cache = {}

export default lll;

Object.assign(lll, {Component});

async function lll(/* ...components, opts = {}, callback */) {
  const {components, callback} = classifyArgs(...arguments);
  cache.callback = callback;
  const templates = await bundleTemplate(components);
  const len = templates.length;
  return this.render(templates);
}

lll.render = (templates) => {
  if (!Array.isArray(templates)) {
    return;
  }

  const files = _.chain(templates)
                  .map((template, idx) => {
                    store.dispatch(cacheActions.add(template));
                    if (idx === len - 1) {
                      const cache = store.getState().cache;
                      store.dispatch(treeActions.associate(cache));
                    }
                    return template;
                  })
                  .filter(template => {
                    return template.isLeaf();
                  })
                  .map(template => {
                    const file = template.render();
                    return file;
                  })
                  .value();
  const stream = es.readArray(files);
  cache.callback(stream);
};

lll.order = (list, items) => {
  return orderAlign(list, items, 'data.name');
};

lll.dest = destPath => {
  return vfs.dest(destPath);
};

function classifyArgs(...components) {
  const config = require('./config');
  const callback = components.pop();
  const last = components[components.length - 1];

  if (typeof callback !== 'undefined') {
    console.error('Specify the function at the end of the argument');
    process.exit(1);
  }

  if (!(last instanceof Component) &&
      last instanceof Object) {
    const opts = components.pop();
    Object.assign(config, opts);
  }
  return {components, callback};
}

async function bundleTemplate(components) {
  const promises = components.map(component => {
    return component.templates;
  });
  const templateArr = await Promise.all(promises);
  components.forEach((component, idx) => {
    component.templates = templateArr[idx];
    try {
      component.ready(state);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
  const templates = components.reduce((result, component) => {
    return result.concat(component.templates);
  }, []);
  return templates;
}
