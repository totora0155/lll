import hogan from 'hogan.js';
import eventType from './event-type';

export default class Template {
  // constructor({data, content}, event) {
  constructor(file, data, event) {
    this.file = file;
    this.data = data;
    this.event = event;
    this.parent;
    this.children = [];
  }

  set contents(contents) {
    this.file.contents = new Buffer(contents);
  }

  get contents() {
    return this.file.contents.toString();
  }

  get parentName() {
    return this.data.parent;
  }

  hasParent() {
    return Boolean(this.parent != null);
  }

  hasChildren() {
    return Boolean(this.children.length);
  }

  getRelateTemplates() {
    const parents = [this];
    let current = this.parent;
    while (current && current.hasChildren()) {
      parents.unshift(current);
      current = current.parent;
    }
    return parents;
  }

  render() {
    const templates = this.getRelateTemplates();
    const contentsArr = templates.map(_ => _.contents);
    const dataArr = templates.map(_ => _.data);
    const data = Object.assign({}, ...dataArr);
    let result = templates[0].contents;

    templates.slice(1).forEach((template) => {
      data.contents = template.contents;
      result = hogan.compile(result).render(data)
    });

    // TODO:
    this.file.contents = new Buffer(result);
    return this;
  }

  appendChild(template) {
    this.children.push(template);
  }

  willRender() {
    const handles = this.event[eventType.WILL_RENDER];
    if (handles && Array.isArray(handles)) {
      handles.forEach((handle) => {
        this.contents = handle(this.contents, this.data);
      });
    }
    return this;
  }

  update(contents) {
    Object.assign(this, contents);
  }
}
