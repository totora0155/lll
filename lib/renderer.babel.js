import fs from 'fs';
import path from 'path';
import File from 'vinyl';
import glob from 'glob';
import glob2base from 'glob2base';
import matter from 'gray-matter';
import thenify from 'thenify';
import escapeRegExp from 'lodash.escaperegexp';
import Template from './template';
import eventType from './event-type';

const read = thenify(fs.readFile);

const _event = new WeakMap();

const ENC = 'utf-8';

export default class Renderer {
  constructor(pattern, opts) {
    this.templates = init.call(this, new glob.Glob(pattern), opts || {});
    this.pattern = pattern;
    _event.set(this, {});
  }

  on(e, handle) {
    const event = _event.get(this);
    if (!event[e]) {
      event[e] = [];
    }

    event[e].push(handle);
    _event.set(this, event);
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
}

function init(glob, opts) {
  return new Promise((resolve, reject) => {
    glob.on('error', (err) => reject(err));

    const templates = {};
    let last;

    glob.on('match', async (filePath) => {
      const extName = path.extname(filePath);
      const baseName = path.basename(filePath, extName);
      const raw = await read(filePath, ENC);
      const event = _event.get(this);
      const {data, content: contents} = matter(raw);

      const file = new File({
        base: glob2base(glob),
        path: filePath,
        contents: new Buffer(contents),
      });
      templates[baseName] = new Template(file, data, opts, event);

      if (filePath === last) {
        return resolve(templates);
      }
    });
    glob.on('end', (fileList) => {
      last = fileList[fileList.length -1];
    });
  })
}
