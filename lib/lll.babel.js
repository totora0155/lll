import eventType from './event-type';
import Renderer from './renderer';

let _handleThen;

export default lll;

async function lll(...renderers) {
  const promises = renderers.map(renderer => renderer.templates);
  const templates = await Promise.all(promises);
  const all = Object.assign({}, ...templates);

  return Object.keys(all)
    .map(name => all[name])
    .map(template => template.willRender())
    .map((template) => {
      if (template.parent) {
        all[template.parent].appendChild(template);
      }
      return template;
    })
    .filter(template => !template.hasParent())
    .map(template => template.render());
}

lll.Renderer = Renderer;
Object.assign(lll, eventType);
