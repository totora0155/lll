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

  renderChildren(data) {
    // TODO: array
    return this.children
      .map((template) => {
        if (template.childrenCount > 0) {
          // TODO: process
        } else {
          Object.assign(data, template.data);
          Object.assign(data, {content: template.render(data)});
        }
        return data;
      })[0];
  }

  appendChild(template) {
    this.children.push(template);
    this.childrenCount++;
  }
}
