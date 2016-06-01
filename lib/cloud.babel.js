import path from 'path';
import _ from 'lodash';
import File from 'vinyl';

const defaults = {
  extname: '.html',
  cleanURL: true,
  watch: false
};

export default class Cloud {
  constructor(name, {data, opts}) {
    this.name = name;
    this.data = Object.assign({}, defaults, data);
    this.opts = Object.assign({}, opts);
    this.list = [];
    this.templates = [];
  }

  get nameList() {
    return _.map(this.data, value => value.name);
  }

  hasItem(name) {
    return Boolean(~_.findIndex(this.list, {name}));
  }

  buildFiles(parent) {
    const config = require('./config').default;
    const files = _.map(this.list, item => {
      const file = new File({
        base: (({cleanURL, dirname}) => {
          if (cleanURL && dirname) {
            return path.resolve(config.cwd, dirname, item.name, 'index.html');
          } else if (cleanURL) {
            return path.resolve(config.cwd, item.name, 'index.html');
          } else {
            return path.resolve(config.cwd, `${item.name}.html`);
          }
        })(this.data),
        contents: new Buffer(parent.contents)
      });
      return file;
    });
    debugger;
    return files;
  }

  add(name, item) {
    this.list.push({
      name,
      count: 1,
      items: [item]
    })
  }

  update(name, item) {
    const target = _.find(this.list, {name});
    target.count++;
    target.items.push(item);
  }
}
