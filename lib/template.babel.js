import fs from 'fs';
import _ from 'lodash';
import File from 'vinyl';
import matter from 'gray-matter';
import hogan from 'hogan.js';
import config from './config';
import TemplateBase from './template-base';
import lll from './lll';
import {getRelateTree} from './tree';
import state from './state';

export default class Template extends TemplateBase {
  isLeaf() {
    return this.rel.children === null;
  }

  getParents() {
    const result = [];
    let target = this.rel.parent;
    while (target.rel.parent !== null) {
      result.unshift(target);
      target = this.rel.parent;
    }
    return result;
  }

  getChildren(result = []) {
    const result = [];
    let target = this.rel.parent;
    while (target.rel.children !== null) {
      _.forEach(target.rel.children, child => {
        result.push(child);
        result = this.getChildren(result);
      });
    }
    return result;
  }

  relateTree() {
    return [...this.getParents, this, ...this.getChildren];
  }

  associate(renderers) {
    if (!this.parentName) {
      return;
    }

    const parent = _.find(renderers, t => {
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

    const result = pursue.call(this, (result, current) => {
      Object.assign(data, {contents: result});
      return hogan.compile(current.contents).render(data);
    });

    const file = new File({
      base: this.file.base,
      path: this.file.path,
      history: this.file.history,
      contents: new Buffer(result)
    });

    return file;
  }

  update() {
    const raw = fs.readFileSync(this.file.history[0], 'utf-8');
    const {data, content: rawContent} = matter(contents);
    this.contents = this.component.compile(rawContent);
    const templates = tree.getRelateTree();
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
