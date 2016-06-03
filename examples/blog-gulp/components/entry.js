'use strict';
const marked = require('marked');
const lll = require('../../..');
const Component = lll.Component;

const orderList = [
];

module.exports = class Entry extends Component {
  ready() {
    this.createCloud([
      'tags',
      'categories'
    ], {
      parent: 'cloud'
    }, {
      dirname: 'src/entries',
      base: 'src',
      cloud: {
        title(cloudName) {
          switch (cloudName) {
            case 'tags':
              return 'タグ一覧';
            case 'categories':
              return 'カテゴリー一覧';
          }
        }
      }
    });

    this.createCloud([
      'tags',
      'categories'
    ]);
    this.cloud.tags = {
      data: {
        parent: 'cloud'
      },
      opts: {
        dirname: 'src/entries',
        base: 'src',
        cloud: {
          title: 'タグ一覧'
          isolate: true
        }
      }
    };
    this.cloud.categories = this.cloud.tags;
  }

  // order() {
  //   this.templates = lll.order(orderList, this.templates);
  // }

  compile(content) {
    return marked(content);
  }
};
