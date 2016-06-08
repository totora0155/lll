import util from 'util';
import _ from 'lodash';

export default function (data, templates) {
  debugger;
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
        const matches = this.file.dirname.match(/\d+$/);
        const pageNum = matches[0];
        return this.page[pageNum];
      } else {
        const templates = [];
        const page = _.groupBy(items, (() => {
          let pageNum = -1;
          return item => {
            pageNum++;
            templates.push(this.createPage(pageNum));
            return Math.floor(pageNum / count);
          };
        })());
        this.page = page;
      }
    },

    social: {
      twitter() {},
      facebook() {}
    }
  };
}
