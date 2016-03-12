import eventType from './event-type';
import Renderer from './renderer';

let _handleThen;

export default lll;

async function lll(...renderers) {
  const promises = renderers.map(renderer => renderer.templates);
  const templatesOfRenderer = await Promise.all(promises);
  const all = Object.assign({}, ...templatesOfRenderer);

  return Object
          .keys(all)
          .map(name => all[name])
          .map(template => template.willRender())
          .map(prepare.bind(null, all))
          .filter(template => template.hasParent() && !template.hasChildren())
          .map((template) => {
            template.render();
            return template.file;
          });
}

lll.Renderer = Renderer;
Object.assign(lll, eventType);

function prepare(all, template) {
  if (template.parentName) {
    const target = all[template.parentName];
    template.parent = target;
    // TODO:
    target.children.push(template);
  }
  return template;
}
