import _ from 'lodash';
import es from 'event-stream';
import File from 'vinyl';
import vfs from 'vinyl-fs';
import orderAlign from 'order-align';
import Component from './component';
import Template from './template';
import Cloud from './cloud';
import {store, cacheActions, treeActions} from './tree';
import state from './state';

export default lll;

Object.assign(lll, {Component});

async function lll(/* ...components, opts = {} */) {
  const components = classifyArgs(...arguments);
  const templates = await bundleTemplate(components);
  // const coludTemplates = collectsCloud(templates);
  const len = templates.length;
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

// function collectsCloud(templates) {
//   const cloudData = require('./config').default.clouds;
//
//   if (cloudData && typeof cloudData === 'object') {
//     const clouds = collectsUniqKeys(templates, Object.keys(cloudData));
//     const cloudChildPages = _.map(clouds, cloud => {
//       (typeof cloud.data.parent === 'undefined') &&
//         console.error(`clouds.${cloud.name}.data.parent is required`);
//       (typeof cloud.data.dirname === 'undefined') &&
//         console.error(`clouds.${cloud.name}.data.dirname is required`);
//       const parent = _.find(templates, {name: cloud.data.parent});
//       (typeof parent === 'undefined') &&
//         console.error(`clouds.${key}.data.parent was not found`);
//       const files = cloud.buildFiles(parent);
//       const cloudTemplates = _.map(files, file => {
//         return new Template(file, cloud.data, cloud.opts);
//       });
//       debugger;
//     });
//   }
// }
//
// function collectsUniqKeys(templates, targetProps) {
//   const cloudData = require('./config').default.clouds;
//
//   const result = _.reduce(templates, (clouds, template) => {
//     const picked = _.pick(template.data, targetProps);
//     _.forEach(picked, (keys, prop) => {
//       if (typeof keys === 'string') {
//         keys = [keys];
//       }
//
//       const cloud = clouds[prop];
//       if (Array.isArray(keys)) {
//         _.forEach(keys, key => {
//           if (cloud.hasItem(key)) {
//             cloud.update(key, template);
//           } else {
//             cloud.add(key, template);
//           }
//         });
//       }
//     });
//     return clouds;
//   }, _.reduce(targetProps, (current, prop) => {
//     (typeof cloudData[prop] === 'undefined') &&
//       console.error(`clouds.${prop} was not found`);
//
//     current[prop] = new Cloud(prop, cloudData[prop]);
//     return current;
//   }, {}));
//   return result;
// }
