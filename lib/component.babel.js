import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import File from 'vinyl';
import glob from 'glob';
import glob2base from 'glob2base';
import matter from 'gray-matter';
import Template from './template';
import Cloud from './cloud';
import actions from './actions';
import store from './store';
import ComponentBase from './component-base';
import {getToken} from './helpers';

const ENC = 'utf-8';

const defaultOpts = {
  extname: '.html',
  cache: true,
  cleanURL: true,
  output: true,
  watch: false,
  cloud: false,
  json: false
};

export default class Component extends ComponentBase {
  constructor(pattern, opts = {}) {
    super();
    this.pattern = pattern;
    this.glob = new glob.Glob(pattern);
    this.opts = Object.assign({}, defaultOpts, opts, {
      dirname: glob2base(this.glob)
    });
    this.token = getToken(this.pattern);
    this.templates = this.loadTemplates(this.glob);
    this.cloud = {};
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

        if (this.opts.cache && Object.keys(store.getState()._template).length) {
          const cachedTemplate = store.getState()._template[absFilePath];
          const modified = isModified(stat, cachedTemplate.file.stat);
          if (!modified) {
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
          opts: this.opts,
          token: this.token
        });
        templates.push(template);
      });

      glob.on('end', () => resolve(templates));
      glob.on('error', err => reject(err));
    });
  }

  cacheCloudTemplates(cloudName, config) {
    const data = Object.assign({}, this.data, {
      parent: config.cloud.parent
    });
    const _opts = Object.assign({}, this.opts, {
      base: config.cloud.base,
      dirname: config.cloud.dirname
    });
    const opts = Object.assign({}, defaultOpts, _opts, {cache: false});
    const cloud = new Cloud(cloudName, data, opts);
    _.forEach(this.templates, template => {
      let words = template.data[cloudName];
      if (!words) {
        return;
      }
      if (typeof words === 'string') {
        words = [words];
      }

      _.forEach(words, word => {
        if (cloud.hasItem(word)) {
          cloud.update(word, template);
        } else {
          cloud.add(word, template);
        }
      });
    });

    return cloud;
  }

  createCloudTemplates(cloudName) {
    const config = this.cloud[cloudName];
    const data = Object.assign({}, this.data, (config.data || {}));
    const _opts = Object.assign({}, this.opts, (config.opts || {}));
    const opts = Object.assign({}, defaultOpts, _opts, {cache: false});
    const cloud = new Cloud(cloudName, data, opts);
    const cachedTemplate = store.getState()._template;
    // catch error...
    const parent = _.find(cachedTemplate, {name: cloud.data.parent});

    _.forEach(this.templates, template => {
      let words = template.data[cloudName];
      if (!words) {
        return;
      }
      if (typeof words === 'string') {
        words = [words];
      }

      _.forEach(words, word => {
        if (cloud.hasItem(word)) {
          cloud.update(word, template);
        } else {
          cloud.add(word, template);
        }
      });
    });

    const token = getToken(`word:${cloudName}`);
    const templates = _.map(cloud.items, word => {
      word.createFile(parent.contents || '');
      return createTemplate({
        base: word.file.base,
        path: word.file.path,
        contents: new Buffer(parent.contents || ''),
        data: Object.assign(word.data, {items: word.items}),
        opts: word.opts,
        token
      });
    });

    {
      const key = `${this.constructor.name.toLowerCase()}.${cloudName}`;
      store.dispatch(actions.cacheCloud(templates, key));
    }
    this.templates = this.templates.concat(templates);
  }
}

function isModified(currentStat, cachedStat) {
  if (currentStat.size === cachedStat.size) {
    return false;
  }
  return true;
}

function divideRaw(raw, compile) {
  const {data, content: rawContent} = matter(raw);
  const contents = (() => {
    try {
      return compile(rawContent);
    } catch (err) {
      console.error(err);
      throw err;
    }
  })();
  return {data, contents};
}

// function createCloudTemplates(groupName, cloud, data, opts) {
//
// }

export function createTemplate({
  base,
  path,
  contents,
  stat,
  data,
  opts,
  token
}) {
  stat = Object.assign({}, stat);
  const file = new File({base, path, contents, stat});
  if (opts.extname) {
    file.extname = opts.extname;
  }
  if (opts.cleanURL && file.stem !== 'index') {
    file.dirname += `/${file.stem}`;
    file.stem = 'index';
  }
  return new Template(file, data, opts, token);
}
