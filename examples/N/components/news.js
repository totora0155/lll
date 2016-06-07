'use strict';
const marked = require('marked');
const lll = require('../../..');
const Component = lll.Component;

module.exports = class News extends Component {
  constructor(pattern, opts) {
    super(pattern, opts);
    this.cloud.tags = true;
    this.cloud.categories = true;
  }

  compile(content) {
    return marked(content);
  }
};
