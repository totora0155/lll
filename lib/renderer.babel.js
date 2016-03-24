import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import File from 'vinyl';
import glob from 'glob';
import glob2base from 'glob2base';
import matter from 'gray-matter';
import thenify from 'thenify';
import cloneDeep from 'lodash.clonedeep';
import Template from './template';
import eventType from './event-type';
import {createTemplates} from './helper';

const ENC = 'utf-8';

const read = thenify(fs.readFile);
const defaults = {
  extname: '.html',
  cleanURL: true,
};

export default class Renderer {
  static createTemplateWithBasic(basic, groups) {
    const templates = [];

    _.forEach(groups, (group) => {
      const file = basic.file.clone(true);
      if (basic.renderer.opts.cleanURL) {
        file.dirname = file.dirname.replace(/[^\/]+$/, group.name);
      } else {
        file.stem = group.name;
      }
      const candidate = {name: group.name, items: group.items};
      const data = Object.assign({}, basic.data);
      _.forEach(data, (val, prop) => {
        if (val[0] === ':') {
          data[prop] = candidate[val.slice(1)];
        }
      });
      templates.push(new Template(file, data, basic.renderer));
    });

    return templates;
  }

  constructor(pattern, opts = {}) {
    this.templates = createTemplates.call(this, new glob.Glob(pattern));
    this.pattern = pattern;
    this.opts = Object.assign({}, defaults, opts);
    this.event = {};
    this.state = {};
  }

  getTemplateByName(name) {
    return _.find(this.templates, (t) => t.data.name === name);
  }

  on(e, handle) {
    if (!this.event[e]) {
      this.event[e] = [];
    }
    this.event[e].push(handle);
  }

  // TODO:
  hasTemplate(name) {
    (async () => {
      const templates = await this.templates;
      const idx = templates.findIndex((t) => t.name === name);
      return Boolean(~idx);
    })();
  }

  getTemplate(name) {
    (async () => {
      const templates = await this.templates;
      const template = templates.find(template => template.name === name);
      return tempalte;
    })();
  }

  updateTemplate(template) {
    (async () => {
      const content = await read(template._path);
      template.update({content});
    })();
  }

  clone() {
    return _.cloneDeep(this);
  }

  ready() {
    const handles = this.event[eventType.READY];
    if (handles && Array.isArray(handles)) {
      handles.forEach((handle) => {
        return handle.call(this);
      });
    }
  }
}
