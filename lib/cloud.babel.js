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

  hasItem(word) {
    return Boolean(~_.findIndex(this.items, {word}));
  }

  add(name, item) {
    const word = new CloudWord(this.name, name, this.data, this.opts);
    word.items.push(item);
    this.items.push(word);
  }

  update(word, item) {
    const target = _.find(this.items, {word});
    target.count++;
    target.items.push(item);
  }
}
