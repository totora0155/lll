import {createStore} from 'redux';
import _ from 'lodash';
import actions from './actions';
const {ACTION_TYPE} = actions;

const defaultState = {
  _template: {},
  template: {},
  cloud: {},
  token: {},
  tree: {}
};

function reduce(state = defaultState, action) {
  switch (action.type) {
    case ACTION_TYPE.CACHE_TEMPLATE:
      {
        const {templates, key} = action;
        _.forEach(templates, template => {
          if (template.opts.cache) {
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
    case ACTION_TYPE.CACHE_TOKEN:
      {
        const {token, key} = action;
        _.set(state.token, key, token);
        return state;
      }
    case ACTION_TYPE.ASSOCIATE:
      {
        const {templates} = action;
        state.tree = createTree(templates);
        return state;
      }
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
          if (base.token === (children[idx - 1] || {}).token) {
            return children[idx - 1];
          }
          return null;
        })(),
        next: (() => {
          if (base.token === (children[idx + 1] || {}).token) {
            return children[idx + 1];
          }
          return null;
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
