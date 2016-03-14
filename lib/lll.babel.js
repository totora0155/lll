import _ from 'lodash';
import eventType from './event-type';
import Renderer from './renderer';

let config;
try {
  config = require(`${process.cwd()}/lll.config`);
} catch (e) {
  config = {};
  console.warn('Not found lll.config.js');
}

export default lll;

async function lll(...renderers) {
  const promises = renderers.map((renderer) => renderer.templates);
  const templatesOfRenderer = await Promise.all(promises);
  const all = Object.assign({}, ...templatesOfRenderer);

  _.forEach(renderers, (renderer) => {
    renderer.ready();
  });

  templatesOfRenderer.forEach((templates, idx) => {
    renderers[idx].templates = templates;
  });

  return Object
          .keys(all)
          .map((name) => all[name])
          .map((template) => template.willRender())
          .map(prepare.bind(null, all))
          .filter((template) => template.hasParent() && !template.hasChildren())
          .map((template) => {
            const file = template.render(config);
            return file;
          });
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

lll.Renderer = Renderer;
Object.assign(lll, eventType);

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
