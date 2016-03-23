import _ from 'lodash';
import eventType from './event-type';
import Partial from './partial';
import Renderer from './renderer';
import config from './config';

export default lll;

async function lll(/* ...parts, opts = {} */) {
  let parts;
  let opts;

  const args = [...arguments];
  const last = args[args.length - 1];
  if (!(last instanceof Partial)
      && !(last instanceof Renderer)
      && last instanceof Object) {
    opts = args.pop();
    parts = args;
    Object.assign(config, opts);
  } else {
    parts = args;
  }

  const templates = await Promise.all(_.map(parts, (part) => part.templates));
  const {partials, renderers} = replaceAndGrouping(parts, templates);

  const templatesOfPartial = (() => {
    let result = {};
    const templatesArr = _.map(partials, (partial) => partial.templates);
    const all = Object.assign({}, ...templatesArr);

    for (const name in all) {
      result[name] = all[name].file.contents.toString();
    }
    return result;
  })();

  const templatesOfRenderer = (() => {
    const templatesArr = _.map(renderers, (renderer, idx) => {
      renderers[idx] = renderer.ready();
      return renderer.templates;
    });
    return Object.assign({}, ...templatesArr);
  })();

  return Object
          .keys(templatesOfRenderer)
          .map((name) => templatesOfRenderer[name])
          .map((template) => template.willRender())
          .map(prepare.bind(null, templatesOfRenderer))
          .filter((template) => template.hasParent() && !template.hasChildren())
          .map((template) => {
            const file = template.render(templatesOfPartial);
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

Object.assign(lll, eventType, {Renderer, Partial});

function replaceAndGrouping(parts, templates) {
  return _.chain(parts)
          .map((part, idx) => {
            part.templates = templates[idx];
            return part;
          })
          .groupBy((part) => {
            if (part instanceof Partial) {
              return 'partials';
            } else if (part instanceof Renderer) {
              return 'renderers';
            }
          })
          .value();
}

function prepare(templatesOfRenderer, template) {
  if (template.parentName) {
    const target = templatesOfRenderer[template.parentName];
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
