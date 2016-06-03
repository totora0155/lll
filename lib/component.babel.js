import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import File from 'vinyl';
import glob from 'glob';
import glob2base from 'glob2base';
import matter from 'gray-matter';
import Template from './template';
import Cloud from './cloud';
import CloudWord from './cloud-word';
import actions from './actions';
import store from './store';

import ComponentBase from './component-base';

const ENC = 'utf-8';

const defaultOpts = {
  extname: '.html',
  cache: true,
  cleanURL: true,
  output: true,
  watch: false,
  cloud: false,
};

export default class Component extends ComponentBase {
  constructor(pattern, opts = {}) {
    super();
    this.pattern = pattern;
    this.opts = Object.assign({}, defaultOpts, opts);
    this.templates = this.loadTemplates(new glob.Glob(pattern));
    this.clouds = {};
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
        const absFilePath = path.resolve(filePath);
        const stat = fs.statSync(absFilePath);

        if (Object.keys(store.getState().cache).length) {
          const cachedTemplate = store.getState().cache[absFilePath];
          const modified = isModified(stat, cachedTemplate.file.stat, () => {
            templates.push(cachedTemplate);
          });
          if (modified) {
            return;
          }
        }

        const raw = fs.readFileSync(filePath, ENC);
        const {data, contents} = divideRaw(raw, this.compile);

        const template = createTemplate({
          base: path.resolve(this.opts.base || glob2base(glob)),
          path: path.resolve(filePath),
          contents: new Buffer(contents),
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

  createCloud(cloudProps, data, opts) {
    opts = Object.assign({}, defaultOpts, opts)
    if (typeof cloudProps === 'string') {
      cloudProps = [cloudProps];
    }

    const cloudPropIterate = (props, cb) => {
      _.forEach(props, (values, key) => {
        if (!values) {
          return;
        }
        if (typeof values === 'string') {
          values = [values];
        }
        cb(values, key);
      });
    }
    const cloudWordIterate = (words, cb) => _.forEach(words, cb);

    this.clouds = _.reduce(this.templates, (clouds, template) => {
      const targetProps = _.pick(template.data, cloudProps);
      cloudPropIterate(targetProps, (words, cloudName) => {
        cloudWordIterate(words, word => {
          const cloud = clouds[cloudName];
          if (cloud.hasItem(word)) {
            cloud.update(template);
          } else {
            cloud.add(word, template);
          }
        });
      });
      return clouds;
    }, _.reduce(cloudProps, (current, cloudName) => {
      if (opts.cloud) {
        if (opts.cloud.isolate) {
          const groupName = this.constructor.name;
          current[groupName][cloudName] = new Cloud(cloudName, data, opts);
          return current;
        }
      }
      current[cloudName] = new Cloud(cloudName, data, opts);
      return current;
    }, {}));

    const templates = createCloudTemplates(this.clouds, data, opts);
    this.templates = this.templates.concat(templates);
  }
}

function isModified(currentStat, cachedStat, cb) {
  const currentMtime = Date.parse(currentStat.mtime);
  const cachedMtime = Date.parse(cachedStat.mtime);
  if (currentMtime === cachedMtime &&
      currentStat.size === cachedStat.size) {
    cb();
    return true;
  } else if (currentMtime !== cachedMtime &&
             currentStat.size === cachedStat.size) {
    cb();
    return true;
  }
  return false;
}

function divideRaw(raw, compile) {
  const {data, content: rawContent} = matter(raw);
  const contents = (() => {
    try {
      return compile(rawContent);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
  return {data, contents};
}

function createCloudTemplates(clouds, data, opts) {
  opts = Object.assign({}, defaultOpts, opts, {cache: false});
  const {cache} = store.getState();
  const parent = _.find(cache, {name: data.parent});
  const templates = [];

  _.forEach(clouds, (cloud, cloudName) => {
    // Create [dirname]/[cloudName]/index.html
    if (opts.cloud) {
      const index = new CloudWord(cloudName, 'index', data, opts);
      index.createFile(parent ? parent.contents : '');
      Object.assign(index.data, {items: cloud.items});

      const template = createTemplate({
        base: index.file.base,
        path: index.file.path,
        contents: new Buffer(index.contents),
        data: index.data,
        opts
      });
      template.data.title = (() => {
        if (typeof opts.cloud.title === 'function') {
          return opts.cloud.title(cloudName);
        } else {
          return opts.cloud.title;
        }
      })();
      templates.push(template);
    }

    _.forEach(cloud.items, word => {
      // store.dispatch(actions.collectCloud(word));
      word.createFile(parent ? parent.contents : '');
      Object.assign(word.data, {items: word.items})
      const template = createTemplate({
        base: word.file.base,
        path: word.file.path,
        contents: new Buffer(word.contents),
        data: word.data,
        opts
      });
      template.data.title = word.name;
      templates.push(template);
    });

    store.dispatch(actions.cacheCloud(cloudName, cloud.items));
  });

  return templates;
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
