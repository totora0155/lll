import __ from 'lodash';

export default class ComponentBase {
  ready() {}
  order(templates) {
    return __.chain(templates)
             .sortBy(t => t.published)
             .reverse()
             .value();
  }
  compile(raw) {
    return raw;
  }
}
