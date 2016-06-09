import __ from 'lodash';
import File from 'vinyl';
import config from './config';
import TemplateBase from './template-base';
import store from './store';
import {createTemplate} from './component';
import templateHelpers from './template-helpers';

export default class Template extends TemplateBase {
  isLeaf() {
    return this.rel.children === null;
  }

  relationTree() {
    // return tree.getRelation(this);
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

  createPage(pageNum, group) {
    const template = createTemplate({
      base: this.file.base,
      path: this.file.path.replace('index.html', `${pageNum}/index.html`),
      contents: this.file.contents,
      stem: this.file.stem,
      data: this.data,
      opts: this.opts
    });
    template.page = group;
    template.rel = this.rel;
    return template;
  }

  render() {
    const templateData = pursue.call(this, (result, current) => {
      return Object.assign(result, current.data);
    }, {});
    const state = store.getState();
    const data = Object.assign({}, templateData, {state}, config, {
      rel: this.rel,
      file: this.file
    });

    const result = pursue.call(this, (html, currentTemplate) => {
      Object.assign(data, {contents: html});
      try {
        __.templateSettings.imports =
          templateHelpers.call(this, data);
        __.templateSettings.imports._ = __;
        html = __.template(currentTemplate.contents)(data);
      } catch (err) {
        console.log(err);
      }
      return html;
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
