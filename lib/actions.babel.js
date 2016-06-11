import keyMirror from 'keymirror';

const ACTION_TYPE = keyMirror({
  CACHE_TEMPLATE: null,
  CACHE_CLOUD: null,
  CACHE_TOKEN: null,
  ASSOCIATE: null
});

const actions = {
  cacheTemplate(templates, key) {
    return {type: this.ACTION_TYPE.CACHE_TEMPLATE, templates, key};
  },
  cacheCloud(templates, key) {
    return {
      type: this.ACTION_TYPE.CACHE_CLOUD,
      templates,
      key
    };
  },
  cacheToken(token, key) {
    return {
      type: this.ACTION_TYPE.CACHE_TOKEN,
      token,
      key
    };
  },
  associate(templates) {
    return {type: this.ACTION_TYPE.ASSOCIATE, templates};
  }
};

// const actionsHelper = {
//   getRelation(template) {}
// }

export default Object.assign(actions, {ACTION_TYPE});
