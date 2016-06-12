import __ from 'lodash';
import moment from 'moment';

export default class ComponentBase {
  ready() {}
  order(templates) {
    return __.chain(templates)
             .sortBy(t => moment(new Date(t.published)).format())
             .reverse()
             .value();
  }
  compile(raw) {
    return raw;
  }
}
