import _ from 'lodash';
import util from 'util';

export default function (data) {
  return {
    debug(key, depth = 2) {
      let target = null;
      if (key) {
        target = _.get(data, key);
      }
      if (target) {
        return util.inspect(target, {depth});
      } else {
        return util.inspect(data, {depth});
      }
    },

    title() {},
    description() {},

    social: {
      twitter() {},
      facebook() {}
    }
  };
}
