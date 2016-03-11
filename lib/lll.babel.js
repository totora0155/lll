import eventType from './event-type';
import Renderer from './renderer';

export default lll;

async function lll(...renderers) {
  const promises = renderers.map(renderer => renderer.templates);
  const templates = await Promise.all(promises);
  const all = Object.assign({}, ...templates);

  const x = Object.keys(all)
    .map((name) => {
      const template = all[name];
      {
        const parent = template.data.parent;
        if (parent && typeof parent === 'string') {
          all[parent].appendChild(template);
        }
      }
      return template;
    })
    .filter((template) => {
      return template.childrenCount > 0;
    })
    .map((template) => {
      return template.render();
    });
  console.log(x[0]);
}

lll.Renderer = Renderer;
Object.assign(lll, eventType);
