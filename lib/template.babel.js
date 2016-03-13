import path from 'path';
import File from 'vinyl';
import hogan from 'hogan.js';
import eventType from './event-type';
import escapeRegExp from 'lodash.escapeRegExp';

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

  get contents() {
    return this.file.contents.toString();
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

  render() {
    const templates = this.getRelateTemplates();
    const contentsArr = templates.map((template) => template.contents);
    const dataArr = templates.map((template) => template.data);
    const data = Object.assign({}, ...dataArr);
    let result = templates[0].contents;

    templates.slice(1).forEach((template) => {
      data.contents = template.contents;
      result = hogan.compile(result).render(data);
    });
    // Because of the remaining `{{...}}`
    result = hogan.compile(result).render(data);

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
