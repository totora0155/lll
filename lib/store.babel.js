import {createStore} from 'redux';
import _ from 'lodash';
import actions from './actions';
const {ACTION_TYPE} = actions;

const defaultState = {
  cache: {},
  tree: {}
};

function reduce(state = defaultState, action) {
  switch (action.type) {
    case ACTION_TYPE.CACHE_TEMPLATE:
      {
        const {templates} = action;
        _.forEach(templates, template => {
          if (template.opts.cache) {
            if (typeof state.cache.template === 'undefined') {
              state.template = {};
            }
            state.template[template.file.history[0]] = template;
          }
        });
        return state;
      }
      return;
    case  ACTION_TYPE.CACHE_CLOUD:
      {
        const {groupName, cloudName, words} = action;
        if (typeof state.cache.cloud === 'undefined') {
          state.cloud = {};
        }
        if (typeof state.cache.cloud[groupName] === 'undefined') {
          state.cloud[groupName] = {};
        }
        if (typeof state.cache.cloud[groupName][cloudName] === 'undefined') {
          state.cloud[groupName][cloudName] = {};
        }
        _.forEach(words, word => {
          state.cloud[groupName][cloudName][word.name] = word;
        });
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
    const childrenNode = stack.call(base, templates)
    tree[base.name] = {template: base, nodes: childrenNode}
    Object.assign(base.rel, {
      parent: null,
      children: childrenNode
    });
  });
  return tree;
}

function stack(templates) {
  const children = _.filter(templates, t => t.parent === this.name)
  if (children.length) {
    return _.reduce(children, (result, base, idx) => {
      const childrenNode = stack.call(base, templates);
      Object.assign(base.rel, {
        parent: this,
        children: childrenNode || null,
        prev: (() => {
          if (idx === 0) {return null;}
          else {return children[idx - 1]}
        })(),
        next: (() => {
          if (idx === children.length - 1) {return null;}
          else {return children[idx + 1]}
        })()
      })
      result[base.name] = {
        template: base,
        nodes: childrenNode
      }
      return result;
    }, {});
  }
  return null;
}
