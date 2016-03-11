import eventType from './event-type';
import Renderer from './renderer';

let _handleThen;

export default lll;

function lll(...renderers) {
  (async () => {
    const promises = renderers.map(renderer => renderer.templates);
    const templates = await Promise.all(promises);
    const all = Object.assign({}, ...templates);

    const x = Object.keys(all)
      .map(name => all[name])
      .map(template => template.willRender())
      .map((template) => {
        if (template.data.parent) {
          all[template.data.parent].appendChild(template);
        }
        return template;
      })
      .filter(template => template.childrenCount > 0)
      .map(template => template.render());

    if (_handleThen && typeof _handleThen === 'function') {
      _handleThen(x[0])
    }
  })();

  return lll;
}

lll.then = ((handle) => {
  _handleThen = handle;
});

lll.Renderer = Renderer;
Object.assign(lll, eventType);
