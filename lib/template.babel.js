import hogan from 'hogan.js';
import eventType from './event-type';

export default class Template {
  constructor({data, content}, event) {
    this.data = data;
    this.content = content;
    this.event = event;
    this.childrenCount = 0;
    this.children = [];
  }

  render() {
    const data = Object.assign({}, this.renderChildren({}), this.data);

    const handles = this.event[eventType.WILL_RENDER];
    if (handles && Array.isArray(handles)) {
      handles.forEach((handle) => {
        this.content = handle(this.content);
      });
    }

    return hogan.compile(this.content).render(data);
  }

  renderChildren(_data) {
    // TODO: array
    return this.children
      .map((template) => {
        if (template.childrenCount > 0) {
          const inheritance = template.renderChildren(_data);
          const data = Object.assign({}, inheritance, template.data);
          Object.assign(data, {content: template.render(data)});
          data.history.unshift(data.content);
          return data;
        } else {
          const data = _data;
          Object.assign(data, template.data);
          Object.assign(data, {content: template.render(data)});
          data.history = [data.content];
          return data;
        }
      })[0];
  }

  appendChild(template) {
    this.children.push(template);
    this.childrenCount++;
  }

  update(content) {
    Object.assign(this, content);
  }
}
