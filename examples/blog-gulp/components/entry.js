'use strict';
const marked = require('marked');
const lll = require('../../..');
const Component = lll.Component;

const orderList = [
];

module.exports = class Entry extends Component {
  ready() {
    this.setCloud([
      'tags',
      'categories'
    ]);
    // this.setState(['tags', 'categories']);
  }

  // order() {
  //   this.templates = lll.order(orderList, this.templates);
  // }

  compile(content) {
    return marked(content);
  }
};
