import path from 'path';
import moment from 'moment';
import {toCamelCase} from 'strman';
import config from './config';

const pageMap = new WeakMap();

export default class TemplateBase {
  constructor(file, data, opts, token) {
    this.file = file;
    this.data = initData.call(this, data);
    this.opts = opts;
    this.token = token;
    this.children = [];
    this.rel = {
      parent: null,
      children: null,
      prev: null,
      next: null
    };
    pageMap.set(this, {});
  }

  set page(obj) {
    const map = pageMap.has(this) ? pageMap.get(this) : {};
    pageMap.set(this, Object.assign(map, obj));
  }

  get page() {
    return pageMap.get(this);
  }

  get parent() {
    if (this.data.parent) {
      return this.data.parent;
    } else if (this.opts.parent) {
      return this.opts.parent;
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

  get headContnets() {
    return '';
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
    if (this.opts.cleanURL) {
      return `${this.file.dirname.replace(this.file.base, '')}/`;
    }
    return `/${this.file.relative}`;
  }

  get parentName() {
    return this.data.parent;
  }

  get author() {
    return this.data.author || config.author;
  }

  get summary() {
    return this.data.summary || '';
  }

  get published() {
    const date = this.data.published || this.file.stat.birthtime;
    return moment(new Date(date)).format();
  }

  get updated() {
    const date = this.data.updated || this.file.stat.mtime;
    return moment(new Date(date)).format();
  }

  get atomId() {
    return '';
  }
}

function initData(data) {
  if (typeof data.name === 'undefined' || data.name === null) {
    const extname = path.extname(this.file.history[0]);
    const basename = path.basename(this.file.history[0], extname);
    data.name = toCamelCase(basename);
  }
  return data;
}
