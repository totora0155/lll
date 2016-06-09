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
      if (Object.keys(this.page).length) {
        return this.page;
      }
      const grouped = _.groupBy(items, (() => {
        let pageNum = -1;
        return () => {
          pageNum++;
          return Math.floor(pageNum / count) + 1;
        };
      })());
      _.forEach(Object.keys(grouped).slice(1), pageNum => {
        page.items.push(this.createPage(pageNum, grouped[pageNum]));
      });
      this.page = grouped;
      return grouped[1];
    },

    social: {
      twitter() {},
      facebook() {}
    }
  };
}
