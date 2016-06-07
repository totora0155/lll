import {createStore} from 'redux';
import _ from 'lodash';
import actions from './actions';
const {ACTION_TYPE} = actions;

const defaultState = {
  _template: {},
  template: {},
  cloud: {},
  tree: {}
};

function reduce(state = defaultState, action) {
  switch (action.type) {
    case ACTION_TYPE.CACHE_TEMPLATE:
      {
        const {templates, key} = action;
        _.forEach(templates, template => {
          if (template.opts.cache) {
            if (typeof state.template === 'undefined') {
              state._template = {};
            }
            state._template[template.file.history[0]] = template;
          }
        });
        _.set(state.template, key, templates);
        return state;
      }
    case ACTION_TYPE.CACHE_CLOUD:
      {
        const {templates, key} = action;
        _.set(state.cloud, key, templates);
        return state;
      }
    case ACTION_TYPE.ASSOCIATE:
      {
        const {templates} = action;
        state.tree = createTree(templates);
      }
      return state;
    default:
      return state;
  }
}

export default createStore(reduce);

function createTree(templates) {
  const bases = _.filter(templates, t => t.parent === null);
  const tree = {};

  _.forEach(bases, base => {
    const childrenNode = stack.call(base, templates);
    tree[base.name] = {template: base, nodes: childrenNode};
    Object.assign(base.rel, {
      parent: null,
      children: childrenNode
    });
  });
  return tree;
}

function stack(templates) {
  const children = _.filter(templates, t => t.parent === this.name);
  if (children.length) {
    return _.reduce(children, (result, base, idx) => {
      const childrenNode = stack.call(base, templates);
      Object.assign(base.rel, {
        parent: this,
        children: childrenNode || null,
        prev: (() => {
          if (idx === 0) {
            return null;
          }
          return children[idx - 1];
        })(),
        next: (() => {
          if (idx === children.length - 1) {
            return null;
          }
          return children[idx + 1];
        })()
      });
      result[base.name] = {
        template: base,
        nodes: childrenNode
      };
      return result;
    }, {});
  }
  return null;
}
