import __ from 'lodash';
import File from 'vinyl';
// import hogan from 'hogan.js';
import config from './config';
import TemplateBase from './template-base';
import tree from './tree';
import state from './state';

export default class Template extends TemplateBase {
  isLeaf() {
    return this.rel.children === null;
  }

  relationTree() {
    return tree.getRelation(this);
  }

  associate(renderers) {
    if (!this.parentName) {
      return;
    }

    const parent = __.find(renderers, t => {
      return t.data.name === this.parentName;
    });
    if (!parent) {
      throw new Error(`Not found template. name: ${this.parentName}`);
    }
    this.parent = parent;
    parent.children.push(this);
  }

  appendChild(template) {
    this.children.push(template);
  }

  render() {
    const templateData = pursue.call(this, (result, current) => {
      return Object.assign(result, current.data);
    }, {});
    const data = Object.assign({}, templateData, {state}, config, {
      rel: this.rel
    });

    const result = pursue.call(this, (html, currentTemplate) => {
      debugger;
      Object.assign(data, {contents: html});
      html = __.template(currentTemplate.contents)(data);
      return html;
      // return hogan.compile(current.contents).render(data);
    });

    const file = new File({
      base: this.file.base,
      path: this.file.path,
      history: this.file.history,
      contents: new Buffer(result)
    });

    return file;
  }
}

function pursue(callback, initialData = null) {
  let data = initialData;
  let target = this;
  let idx = 0;

  while (target.rel.parent !== null) {
    data = callback(data, target);
    idx++;
    target = target.rel.parent;
  }

  data = callback(data, target, idx);
  return data;
}
