'use strict';
const marked = require('marked');
const lll = require('../../..');
const Component = lll.Component;

const orderList = [
  'top',
  'howToUse',
  'getStarted'
];

module.exports = class Pages extends Component {
  ready(state) {
    this.templates = lll.order(orderList, this.templates);
    state.pages = this.templates;
  }

  compile(content) {
    return marked(content);
  }
};
