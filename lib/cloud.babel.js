import path from 'path';
import _ from 'lodash';
import File from 'vinyl';
import CloudWord from './cloud-word';

export default class Cloud {
  constructor(name, data, opts) {
    this.name = name;
    this.data = Object.assign({}, data);
    this.opts = Object.assign({}, opts);
    this.items = [];
    this.templates = [];
  }

  get title() {
    if (typeof opts.cloud.title === 'function') {
      return opts.cloud.title(this.name);
    }
    return opts.cloud.title;
  }

  get nameList() {
    return _.map(this.data, value => value.name);
  }

  hasItem(name) {
    return Boolean(~_.findIndex(this.list, {name}));
  }

  add(name, item) {
    const word = new CloudWord(this.name, name, this.data, this.opts);
    this.items.push(word);
  }

  update(name, item) {
    const word = _.find(this.items, {name});
    word.count++;
    word.items.push(item);
  }
}
