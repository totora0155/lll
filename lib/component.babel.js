import fs from 'fs';
import path from 'path';
import File from 'vinyl';
import glob from 'glob';
import glob2base from 'glob2base';
import matter from 'gray-matter';
import Template from './template';
import {store} from './tree';

const ENC = 'utf-8';

const defaults = {
  extname: '.html',
  cleanURL: true,
  watch: false
};

export default class Component {
  constructor(pattern, opts = {}) {
    this.pattern = pattern;
    this.opts = Object.assign({}, defaults, opts);
    this.templates = this.loadTemplates(new glob.Glob(pattern));
    // this.watcher = (() => {
    //   if (this.opts.watch) {
    //     const watcher = chokidar.watch(pattern);
    //     watcher.on('change', filePath => {
    //       const idx = _.findIndex(this.templates, tmpl => {
    //         return tmpl.file.history[0] === path.resolve(filePath);
    //       });
    //       this.templates[idx].update();
    //     });
    //     return watcher;
    //   }
    //   return null;
    // })();
  }
  loadTemplates(glob) {
    return new Promise((resolve, reject) => {
      const templates = [];
      glob.on('match', filePath => {
        const stat = fs.statSync(filePath);
        if (Object.keys(store.getState().cache).length) {
          const cachedTemplate = store.getState().cache[path.resolve(filePath)];
          const cachedMtime = Date.parse(cachedTemplate.file.stat.mtime);
          const cachedSize = cachedTemplate.file.stat.size;

          if (Date.parse(stat.mtime) === cachedMtime &&
              stat.size === cachedSize) {
            templates.push(cachedTemplate);
            return;
          } else if (Date.parse(stat.mtime) !== cachedMtime &&
                     stat.size === cachedSize) {
            templates.push(cachedTemplate);
            return;
          }
        }

        const raw = fs.readFileSync(filePath, ENC);
        const {data, content: rawContent} = matter(raw);
        const contents = (() => {
          try {
            return this.compile(rawContent);
          } catch (e) {
            console.error(e);
            process.exit(1);
          }
        })();

        const file = new File({
          base: path.resolve(this.opts.base || glob2base(glob)),
          path: path.resolve(filePath),
          contents: new Buffer(contents),
          stat
        });
        if (this.opts.extname) {
          file.extname = this.opts.extname;
        }
        if (this.opts.cleanURL && file.stem !== 'index') {
          file.dirname += `/${file.stem}`;
          file.stem = 'index';
        }
        const template = new Template(file, data, this);
        templates.push(template);
      });

      glob.on('end', () => {
        return resolve(templates);
        // if (this.constructor.name === 'Renderer') {
        //   config.groups.forEach(group => {
        //     let grouped;
        //     grouped = groupFrom(templates, `data.${group}`);
        //     grouped = _.map(grouped, (items, name) => {
        //       return {items, name};
        //     });
        //     this.state[group] = grouped;
        //   });
          // return resolve(templates);
        // }

        // const obj = templates.reduce((result, tmpl) => {
        //   result[tmpl.data.name] = tmpl;
        //   return result;
        // }, {});
        // return resolve(obj);
      });

      glob.on('error', err => reject(err));
    });
  }

  ready() {}
  compile(raw) {
    return raw;
  }
}
