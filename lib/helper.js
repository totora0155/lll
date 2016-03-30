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

const ENC = 'utf-8';

const stat = thenify(fs.stat);
const read = thenify(fs.readFile);

export function createTemplates(glob) {
  return new Promise((resolve, reject) => {
    glob.on('error', (err) => reject(err));

    // const templates = {};
    const templates = [];
    let last;

    glob.on('match', async (filePath) => {
      const extName = path.extname(filePath);
      const baseName = path.basename(filePath, extName);
      const statData = await stat(filePath);
      const raw = await read(filePath, ENC);
      const {data, content: contents} = matter(raw);

      const file = new File({
        base: path.resolve(this.opts.base || glob2base(glob)),
        path: path.resolve(filePath),
        contents: new Buffer(contents),
        stat: statData,
      });
      if (this.opts.extname) {
        file.extname = this.opts.extname;
      }
      if (this.opts.cleanURL && file.stem !== 'index') {
        file.dirname += '/' + file.stem;
        file.stem = 'index'
      }
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

          if (typeof this.config.sort === 'string') {
            templates.sort((a, b) => {
              switch (this.config.sort) {
                case 'createdAt':
                  return b.file.stat.birthtime - a.file.stat.birthtime;
                case 'updatedAt':
                  return b.file.stat.mtime - a.file.stat.mtime;
              }
            });
          } else if (Array.isArray(this.config.sort)) {
            templates.sort((a, b) => {
              const idxA = this.config.sort.indexOf(a.title);
              const idxB = this.config.sort.indexOf(b.title);
              return idxB - idxA;
            });
          } else if (typeof this.config.sort === 'function') {
            // TODO:
          }
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
