import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import File from 'vinyl';
import glob from 'glob';
import glob2base from 'glob2base';
import matter from 'gray-matter';
import Template from './template';
import {store, cacheActions, treeActions} from './tree';

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

        const template = createTemplate({
          base: path.resolve(this.opts.base || glob2base(glob)),
          path: path.resolve(filePath),
          contents,
          stat,
          data,
          opts: this.opts
        });
        templates.push(template);
      });

      glob.on('end', () => resolve(templates));
      glob.on('error', err => reject(err));
    });
  }

  ready() {}
  compile(raw) {
    return raw;
  }
  createCloud(cloudProps, opts) {
    if (typeof cloudProps === 'string') {
      cloudProps = [cloudProps];
    }

    const classified = _.reduce(this.templates, (current, template) => {
      const targetProps = _.pick(template.data, cloudProps);
      _.forEach(targetProps, (propValues, prop) => {
        propValues || return;
        if (typeof propValues === 'string') {
          propValues = [propValues];
        }

        _.forEach(propValues, value => {
          const index = _.findIndex(current[prop], {name: value});
          if (~index) {
            current[prop].push({
              name: value,
              count: 1,
              items: [template]
            });
          } else {
            current[prop][index].count++;
            current[prop][index].items.push(template);
          }
          return current;
        });
      });
    }, _.reduce(cloudProps, (current, prop) => {
      current[prop] = [];
    }, {}));
  }

  _.forEach(classified, cloud => {
    _.forEach(cloud.list, content => {
      this.templates.push(createTemplate({
        //...
      }));
    });
  });
}

function createTemplate({
  base,
  path,
  contents,
  stat,
  data,
  opts
}) {
  const file = new File({base, path, contents, stat});
  if (opts.extname) {
    file.extname = opts.extname;
  }
  if (opts.cleanURL && file.stem !== 'index') {
    file.dirname += `/${file.stem}`;
    file.stem = 'index';
  }
  return new Template(file, data, opts);
}
