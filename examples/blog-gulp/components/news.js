'use strict';
const marked = require('marked');
const lll = require('../../..');
const Component = lll.Component;

const orderList = [
];

module.exports = class News extends Component {
  constructor() {
    super(...arguments);
    this.cloud.tags = true
    this.cloud.categories = true
  }

  compile(content) {
    return marked(content);
  }
};
