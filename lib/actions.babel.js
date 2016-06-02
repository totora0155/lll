import keyMirror from 'keymirror';

const ACTION_TYPE = keyMirror({
  CACHE: null,
  ASSOCIATE: null,
});

const actions = {
  cache(templates) {
    return {type: this.ACTION_TYPE.CACHE, templates}
  },
  associate(templates) {
    return {type: this.ACTION_TYPE.ASSOCIATE, templates};
  }
}

// const actionsHelper = {
//   getRelation(template) {}
// }

export default Object.assign(actions, {ACTION_TYPE});
