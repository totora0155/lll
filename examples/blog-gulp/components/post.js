'use strict';
const marked = require('marked');
const lll = require('../../..');
const Component = lll.Component;

const orderList = [
];

module.exports = class Post extends Component {
  ready() {
    this.createCloud([
      'tags',
      'categories'
    ], {
      parent: 'cloud'
    }, {
      dirname: 'src/posts',
      base: 'src',
    });
  }

  // order() {
  //   this.templates = lll.order(orderList, this.templates);
  // }

  compile(content) {
    return marked(content);
  }
};
