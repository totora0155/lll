import path from 'path';
import File from 'vinyl';
import hogan from 'hogan.js';
import eventType from './event-type';
import escapeRegExp from 'lodash.escapeRegExp';
import config from './config';

export default class Template {
  constructor(file, data, opts, event) {
    this.file = file;
    this.data = data;
    this.opts = opts;
    this.event = event;
    this.parent;
    this.children = [];
  }

  set contents(contents) {
    this.file.contents = new Buffer(contents);
  }

  get title() {
    if (this.data.title) {
      return this.data.title + ' ' + config.separator + ' ' + config.siteName;
    } else {
      return this.data.title;
    }
  }

  get contents() {
    return this.file.contents.toString();
  }

  get headContents() {
    const c = this.contents;
    return c.slice(0, c.indexOf(config.token.header));
  }

  get url() {
    if (this.opts.cleanURL) {
      return this.file.dirname.replace(this.file.base, '') + '/';
    } else {
      return '/' + this.file.relative;
    }
  }

  get parentName() {
    return this.data.parent;
  }

  hasParent() {
    return Boolean(this.parent != null);
  }

  hasChildren() {
    return Boolean(this.children.length);
  }

  getRelateTemplates() {
    const parents = [this];
    let current = this.parent;
    while (current && current.hasChildren()) {
      parents.unshift(current);
      current = current.parent;
    }
    return parents;
  }

  render(partials) {
    const templates = this.getRelateTemplates();
    const contentsArr = templates.map((template) => template.contents);
    const dataArr = templates.map((template) => template.data);
    const data = Object.assign({}, ...dataArr, config);
    let result = templates[0].contents;

    // TODO: Improve loop
    templates.slice(1).forEach((template) => {
      data.contents = template.contents;
      result = hogan.compile(result).render(data, partials);
    });
    // Because of the remaining `{{...}}`
    result = hogan.compile(result).render(data, partials);

    const file = new File({
      base: this.file.base,
      path: this.file.path,
      history: this.file.history,
      contents: new Buffer(result),
    });
    return file;
  }

  appendChild(template) {
    this.children.push(template);
  }

  willRender() {
    const handles = this.event[eventType.WILL_RENDER];
    if (handles && Array.isArray(handles)) {
      handles.forEach((handle) => {
        this.contents = handle(this.contents, this.data);
      });
    }
    return this;
  }

  update(contents) {
    Object.assign(this, contents);
  }
}