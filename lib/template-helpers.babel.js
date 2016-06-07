import util from 'util';
import _ from 'lodash';

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

    social: {
      twitter() {},
      facebook() {}
    }
  };
}
