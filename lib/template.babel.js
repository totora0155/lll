import path from 'path';
import File from 'vinyl';
import hogan from 'hogan.js';
import eventType from './event-type';
import escapeRegExp from 'lodash.escapeRegExp';
import config from './config';

const defaultData = {
  state: {},
}

export default class Template {
  constructor(file, data, renderer) {
    this.file = file;
    this.data = Object.assign({}, defaultData, data);
    this.renderer = renderer;
    this.parent;
    this.children = [];
  }

  get titleWithSiteName() {
    if (this.data.title) {
      return this.data.title + ' ' + config.separator + ' ' + config.siteName;
    } else {
      return this.data.title;
    }
  }

  get title() {
    return this.data.title;
  }

  set contents(contents) {
    this.file.contents = new Buffer(contents);
  }

  get contents() {
    return this.file.contents.toString();
  }

  get headContents() {
    const c = this.contents;
    return c.slice(0, c.indexOf(config.token.header));
  }

  get url() {
    if (this.renderer.opts.cleanURL) {
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

  associate(renderers) {
    if (!this.parentName) {
      return;
    }

    const parent = _.find(renderers, (template) => {
      return template.data.name === this.parentName;
    });
    if (!parent) {
      throw Error(`Not found template. name: ${this.parentName}`);
    }
    this.parent = parent;
    parent.children.push(this);
  }

  appendChild(template) {
    this.children.push(template);
  }

  render(partials) {
    const templates = this.getRelateTemplates();
    const contentsArr = templates.map((template) => template.contents);
    const dataArr = templates.map((template) => template.data);
    const state = {state: this.renderer.state};
    const data = Object.assign({}, state, ...dataArr, config);
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

  getRelateTemplates() {
    const parents = [this];
    let current = this.parent;
    while (current && current.hasChildren()) {
      parents.unshift(current);
      current = current.parent;
    }
    return parents;
  }



  willRender() {
    const handles = this.renderer.event[eventType.WILL_RENDER];
    if (handles && Array.isArray(handles)) {
      handles.forEach((handle) => {
        this.contents = handle(this.contents, this.data);
      });
    }
  }

  update(contents) {
    Object.assign(this, contents);
  }
}
