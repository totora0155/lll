'use strict';
const marked = require('marked');
const lll = require('../../..');
const Component = lll.Component;

module.exports = class Post extends Component {
  constructor(pattern, opts) {
    super(pattern, opts);
    this.cloud.tags = {
      data: {
        parent: 'cloud'
      },
      opts: {
        cloud: {
          title: 'タグ一覧',
          isolate: true
        }
      }
    };
    this.cloud.categories = {
      data: {
        parent: 'cloud'
      },
      opts: {
        cloud: {
          title: 'カテゴリー一覧',
          isolate: true
        }
      }
    };
  }

  // order() {
  //   this.templates = lll.order(orderList, this.templates);
  // }

  compile(content) {
    return marked(content);
  }
};
