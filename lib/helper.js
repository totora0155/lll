import fs from 'fs';
import path from 'path';
import thenify from 'thenify';
import File from 'vinyl';
import glob from 'glob';
import glob2base from 'glob2base';
import matter from 'gray-matter';
import groupFrom from 'group-from';
import Template from './template';
import config from './config';

const read = thenify(fs.readFile);

const ENC = 'utf-8';

export function createTemplates(glob) {
  return new Promise((resolve, reject) => {
    glob.on('error', (err) => reject(err));

    // const templates = {};
    const templates = [];
    let last;

    glob.on('match', async (filePath) => {
      const extName = path.extname(filePath);
      const baseName = path.basename(filePath, extName);
      const raw = await read(filePath, ENC);
      const {data, content: contents} = matter(raw);

      const file = new File({
        base: path.resolve(this.opts.base || glob2base(glob)),
        path: path.resolve(filePath),
        contents: new Buffer(contents),
      });
      if (this.opts.extname) {
        file.extname = this.opts.extname;
      }
      if (this.opts.cleanURL && file.stem !== 'index') {
        file.dirname += '/' + file.stem;
        file.stem = 'index'
      }
      // templates[data.name || baseName] = new Template(file, data, this);
      const template = new Template(file, data, this);
      templates.push(template);

      if (filePath === last) {
        if (this.constructor.name === 'Renderer') {
          config.groups.forEach((group) => {
            let grouped;
            grouped = groupFrom(templates, `data.${group}`);
            grouped = _.map(grouped, (items, name) => {
              return {items, name}
            });
            this.state[group] = grouped;
          })

          return resolve(templates);
        }

        const obj = templates.reduce((result, template) => {
          result[template.data.name] = template;
          return result;
        }, {});
        return resolve(obj);
      }
    });
    glob.on('end', (fileList) => {
      last = fileList[fileList.length -1];
    });
  })
}
