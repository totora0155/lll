import hogan from 'hogan.js';
import eventType from './event-type';

export default class Template {
  constructor({data, content}, event, opts) {
    this.data = data;
    this.content = content;
    this.event = event;
    this.filePath = opts.filePath;
    this.children = [];
  }

  get parent() {
    return this.data.parent;
  }

  hasParent() {
    return Boolean(this.parent);
  }

  hasChildren() {
    return Boolean(this.children.length);
  }

  render() {
    const data = Object.assign({}, this.prerender({}), this.data);

    {
      let result = this.content;
      for (const content of data.history) {
        data.content = content;
        result = hogan.compile(result).render(data);
      }
      return result;
    }
  }

  prerender(_data) {
    // TODO: array
    return this.children
      .map((template) => {
        if (template.hasChildren() > 0) {
          const inheritance = template.prerender(_data);
          const data = Object.assign({}, inheritance, template.data);
          data.history.unshift(template.content);
          return data;
        } else {
          const data = _data;
          Object.assign(data, template.data);
          data.history = [template.content];
          return data;
        }
      })[0];
  }

  appendChild(template) {
    this.children.push(template);
  }

  willRender() {
    const handles = this.event[eventType.WILL_RENDER];
    if (handles && Array.isArray(handles)) {
      handles.forEach((handle) => {
        this.content = handle(this.content, this.data);
      });
    }
    return this;
  }

  update(content) {
    Object.assign(this, content);
  }
}
