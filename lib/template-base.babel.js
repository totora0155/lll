import config from './config';

export default class TemplateBase {
  constructor(file, data, component) {
    this.file = file;
    this.data = data;
    this.component = component;
    this.children = [];
    this.rel = {
      parent: null,
      children: null,
      prev: null,
      next: null
    };
  }

  get parent() {
    if (this.data.parent) {
      return this.data.parent;
    } else if (this.component.opts.parent) {
      return this.component.opts.parent;
    }
    return null;
  }

  get name() {
    return this.data.name;
  }

  get relate() {
    return;
  }

  get titleWithSiteName() {
    if (this.data.title) {
      return `${this.data.title} ${config.separator} ${config.siteName}`;
    }
    return this.data.title;
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
    if (this.component.opts.cleanURL) {
      return `${this.file.dirname.replace(this.file.base, '')}/`;
    }
    return `/${this.file.relative}`;
  }

  get parentName() {
    return this.data.parent;
  }
}
