import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import File from 'vinyl';
import glob from 'glob';
import glob2base from 'glob2base';
import matter from 'gray-matter';
import thenify from 'thenify';
import escapeRegExp from 'lodash.escaperegexp';
import Template from './template';
import eventType from './event-type';
import {createTemplates} from './helper';

const read = thenify(fs.readFile);

// const _event = new WeakMap();

const ENC = 'utf-8';

export default class Renderer {
  static createTemplateWithBasic(basic, groups) {
    const result = {};

    _.forEach(groups, (groupItems, groupName) => {
      const file = basic.file.clone(true);
      if (basic.renderer.opts.cleanURL) {
        file.dirname = file.dirname.replace(/[^\/]+$/, groupName);
      } else {
        file.stem = name;
      }
      const candidate = {
        name: groupName,
        items: groupItems,
      };
      const data = Object.assign({}, basic.data);
      _.forEach(data, (val, prop) => {
        if (val[0] === ':') {
          data[prop] = candidate[val.slice(1)];
        }
      });
      // TODO: duplicate name
      const prop = groupName + ':' + basic.data.name;
      result[prop] = new Template(
        file,
        data,
        basic.renderer.opts,
        basic.renderer.event
      );
    });
    return result;
  }

  constructor(pattern, opts = {}) {
    // _event.set(this, {});
    // this.templates = createTemplates.call(this, _glob, opts, _event);
    // const _glob = new glob.Glob(pattern);

    this.templates = createTemplates.call(this, new glob.Glob(pattern));
    this.pattern = pattern;
    this.opts = opts;
    this.event = {};
    this.state = {};
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

  ready() {
    // const event = _event.get(this);
    const handles = this.event[eventType.READY];
    if (handles && Array.isArray(handles)) {
      handles.forEach((handle) => {
        return handle(this);
      });
    }
    return this.templates;
  }
}
