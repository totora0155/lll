import util from 'util';
import _ from 'lodash';
import page from './page';

export default function (data) {
  return {
    debug(key, depth = 2) {
      let target = null;
      if (key) {
        target = _.get(data, key);
      }
      if (target) {
        return util.inspect(target, {depth});
      }
      return util.inspect(data, {depth});
    },

    title() {},
    description() {},

    beginFrom(str) {
      const re = new RegExp(_.escapeRegExp(str));
      return re.test(data.file.relative);
    },

    count: (items, count = 10) => {
      if ((_.get(this, 'page.items', [])).length) {
        return this.page.items;
      }
      const grouped = _.groupBy(items, (() => {
        let pageNum = -1;
        return () => {
          pageNum++;
          return Math.floor(pageNum / count) + 1;
        };
      })());
      const templates = [];
      _.forEach(Object.keys(grouped).slice(1), pageNum => {
        const template = this.createPage(pageNum, grouped[pageNum]);
        templates.push(template);
        page.items.push(template);
      });
      _.forEach(templates, (template, idx) => {
        template.page.prev = template[idx - 1] || null;
        template.page.next = template[idx + 1] || null;
      });
      this.page.items = grouped[1];
      this.page.prev = null;
      this.page.next = templates[0];
      return grouped[1];
    },

    hasPrevPage: () => {
      return Boolean(this.page.prev);
    },

    hasNextPage: () => {
      return Boolean(this.page.next);
    },

    social: {
      twitter() {},
      facebook() {}
    }
  };
}
