import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunk from 'redux-thunk';
import _ from 'lodash';
import Template from './template';

export const cacheActionTypes = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
};

export const cacheActions = {
  add(template) {
    return {
      type: cacheActionTypes.ADD,
      template
    };
  },
  remove(template) {
    return {
      type: cacheActionTypes.REMOVE,
      template
    };
  }
};

export const treeActionTypes = {
  ASSOCIATE: 'ASSOCIATE'
};

export const treeActions = {
  associate(templateMap) {
    return {
      type: treeActionTypes.ASSOCIATE,
      templateMap
    };
  }
};

const reducer = combineReducers({
  cache,
  tree
});

export const store = createStore(
  reducer,
  applyMiddleware(thunk)
);

function cache(state = {}, action) {
  switch (action.type) {
    case cacheActionTypes.ADD: {
      const {template} = action;
      return Object.assign({}, state, {[template.name]: template});
    }
    case cacheActionTypes.REMOVE: {
      const {template} = action;
      const newState = Object.assign({}, state);
      delete newState[template.name];
      return newState;
    }
    default: {
      return state;
    }
  }
}

function tree(state = {}, action) {
  switch (action.type) {
    case treeActionTypes.ASSOCIATE: {
      const {templateMap} = action;
      const tree = {};

      const bases = _.filter(templateMap, template => template.parent === null);
      bases.forEach(base => {
        tree[base.name] = stack(templateMap, base);
        Object.assign(base.rel, {
          parent: null,
          children: tree[base.name]
        });
      });
      return tree;
    }
    default: {
      return state;
    }
  }
}

function stack(map, parent) {
  const children = _.filter(map, template => template.parent === parent.name);
  if (children.length) {
    return _.reduce(children, (result, template, idx) => {
      const childrenTree = stack(map, template);
      Object.assign(template.rel, {
        parent,
        children: (() => {
          if (childrenTree instanceof Template) {
            return null;
          }
          return childrenTree;
        })(),
        prev: (() => {
          const prev = children[idx - 1];
          if (typeof prev === 'undefined') {
            return null;
          }
          Object.assign(prev.rel, {next: template});
          return prev;
        })()
      });
      result[template.name] = childrenTree;
      return result;
    }, {});
  }
  return parent;
}
