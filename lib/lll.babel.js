import _ from 'lodash';
import eventType from './event-type';
import Partial from './partial';
import Renderer from './renderer';
import config from './config';

export default lll;

async function lll(/* ...parts, opts = {} */) {
  const args = [...arguments];
  const last = args[args.length - 1];
  if (!(last instanceof Partial)
      && !(last instanceof Renderer)
      && last instanceof Object) {
    const opts = args.pop();
    Object.assign(config, opts);
  }

  const {partials, renderers} = await classifyTemplate(args);
  return _.chain(renderers)
          .map((tmpl) => {
            tmpl.willRender();
            return tmpl;
          })
          .map((tmpl) => {
            tmpl.associate(renderers);
            return tmpl;
          })
          .filter((tmpl) => tmpl.hasParent() && !tmpl.hasChildren())
          .map((tmpl) => tmpl.render(partials).file)
          .value();
}

lll.all = (() => {
  let _event;
  let _handle;
  return (...renderers) => {
    process.nextTick(() => {
      renderers.forEach((r) => r.on(_event, _handle));
    });

    return {
      on(event, handle) {
        [_event, _handle] = [event, handle];
      },
    };
  };
})();

Object.assign(lll, eventType, {Renderer, Partial});

async function classifyTemplate(parts) {
  const templates = await Promise.all(_.map(parts, (p) => p.templates));
  updateTemplates(parts, templates);
  const grouped = _.groupBy(parts, (p) => p.constructor.name.toLowerCase());

  return {
    partials: bundle(grouped.partial),
    renderers: bundle(grouped.renderer),
  };
}

function updateTemplates(parts, templates) {
  parts.forEach((part, idx) => {
    part.templates = templates[idx];
  });
}

function bundle(parts) {
  const arr = _.map(parts, (part) => {
    part.ready();
    return part.templates;
  });

  if (Array.isArray(arr[0])) {
    return Array.concat(...arr)
  } else {
    const obj = Object.assign({}, ...arr);
    _.forEach(obj, (templateValue, templateName) => {
      obj[templateName] = templateValue.contents;
    });
    return obj;
  }
}
