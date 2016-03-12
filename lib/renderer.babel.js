import fs from 'fs';
import path from 'path';
import thenify from 'thenify';
import _glob from 'glob';
import matter from 'gray-matter';
import Template from './template';
import eventType from './event-type';

const glob = thenify(_glob);
const read = thenify(fs.readFile);

const _event = new WeakMap();

const ENC = 'utf-8';

export default class Renderer {
  constructor(pattern) {
    this.templates = init.call(this, pattern);
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
      const idx = templates.findIndex((template) => {
        return template.name === name;
      });
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

async function init(pattern) {
  const templates = {};
  try {
    const fileList = await glob(pattern);
    for (const filePath of fileList) {
      const extName = path.extname(filePath);
      const baseName = path.basename(filePath, extName);
      const contents = await read(filePath, ENC);
      const event = _event.get(this);
      templates[baseName] = new Template(matter(contents), event, {filePath});
    }
  } catch (e) {
    throw e;
  }
  return templates;
}
