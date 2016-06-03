import keyMirror from 'keymirror';

const ACTION_TYPE = keyMirror({
  CACHE_TEMPLATE: null,
  CACHE_CLOUD: null,
  ASSOCIATE: null,
});

const actions = {
  cacheTemplate(templates) {
    return {type: this.ACTION_TYPE.CACHE_TEMPLATE, templates};
  },
  cacheCloud({groupName, cloudName, words}) {
    return {
      type: this.ACTION_TYPE.CACHE_CLOUD,
      groupName,
      cloudName,
      words
    };
  },
  associate(templates) {
    return {type: this.ACTION_TYPE.ASSOCIATE, templates};
  }
}

// const actionsHelper = {
//   getRelation(template) {}
// }

export default Object.assign(actions, {ACTION_TYPE});
