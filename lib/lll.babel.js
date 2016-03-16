import _ from 'lodash';
import eventType from './event-type';
import Component from './component';
import Renderer from './renderer';

let config;
try {
  config = require(`${process.cwd()}/lll.config`);
} catch (e) {
  config = {};
  console.warn('Not found lll.config.js');
}

export default lll;

async function lll(...parts) {
  const templates = await Promise.all(_.map(parts, (part) => part.templates));
  const {components, renderers} = replaceAndGrouping(parts, templates);

  const templatesOfPartial = (() => {
    const templatesArr = _.pick(components, 'templates');
    Object.assign({}, ...templatesArr);
  })

  const templateOfRenderer = (() => {
    const templatesArr = _.pick(renderers, 'templates');
    Object.assign({}, ...templatesArr);
  });

  // const {components, renderers} = _.groupBy(parts, (part) => {
  //   if (part instanceof Component) {
  //     return 'component';
  //   } else if (part instanceof Renderer) {
  //     return 'renderer';
  //   }
  // });
  // // const templatesOfComponent = (() => {
  // const partials = (() => {
  //   const promises = components.map((component) => component.templates);
  //   const templatesArr = await Promise.all(promises);
  //   templatesArr.forEach((templates, idx) => {
  //     components[idx].templates = templates;
  //   });
  //   return Object.assign({}, ...components);
  // })();
  //
  // const templatesOfRenderer = (() => {
  //   const promises = renderers.map((renderer) => renderer.templates);
  //   const templatesArr = await Promise.all(promises);
  //   templatesArr.forEach((templates, idx) => {
  //     renderers[idx].templates = templates;
  //   });
  //   return renderers;
  // })();

  // _.forEach(renderers, (renderer, idx) => {
  //   templatesOfRenderer[idx] = renderer.ready();
  // });
  //
  // // TODO: duplicate name
  // const all = Object.assign({}, ...templatesOfRenderer);
  //
  // return Object
  //         .keys(all)
  //         .map((name) => all[name])
  //         .map((template) => template.willRender())
  //         .map(prepare.bind(null, all))
  //         .filter((template) => template.hasParent() && !template.hasChildren())
  //         .map((template) => {
  //           const file = template.render({config, partials});
  //           return file;
  //         });
}

lll.all = (() => {
  let _event;
  let _handle;

  return (...renderers) => {
    process.nextTick(() => {
      renderers.forEach((renderer) => {
        renderer.on(_event, _handle);
      });
    });

    return {
      on(event, handle) {
        [_event, _handle] = [event, handle];
      },
    };
  };
})();

Object.assign(lll, eventType, {Renderer, Component});

function replaceAndGrouping(parts, templates) {
  return _.chain(parts)
          .map((part, idx) => {
            part.templates = templates[idx];
            return part;
          })
          .groupBy((part) => {
            if (part instanceof Component) {
              return 'components';
            } else if (part instanceof Renderer) {
              return 'renderers';
            }
          })
          .value();
}

function prepare(all, template) {
  if (template.parentName) {
    const target = all[template.parentName];
    template.parent = target;
    // TODO:
    try {
      target.children.push(template);
    } catch (e) {
      const {relative} = template.file;
      throw Error(`Unknown parent in front-matter of ${relative}`);
    }
  }
  return template;
}
