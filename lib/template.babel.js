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
    // {
    //   const handles = this.event[eventType.WILL_RENDER];
    //   if (handles && Array.isArray(handles)) {
    //     handles.forEach((handle) => {
    //       this.content = handle(this.content, this.data);
    //     });
    //   }
    // }

    // {
    //   const handles = this.event[eventType.DID_RENDER];
    //   if (handles && Array.isArray(handles)) {
    //     handles.forEach((handle) => {
    //       this.content = handle(this.content, this.data);
    //       console.log(this.data);
    //     });
    //   }
    // }

    const data = Object.assign({}, this.prerender({}), this.data);

    {
      let result = this.content;
      for (const content of data.history) {
        data.content = content;
        try {
          result = hogan.compile(result).render(data);
        } catch (e) {console.log(e);}
        }
      return result;
    }
  }

  prerender(_data) {
    // TODO: array
    return this.children
      .map((template) => {
        if (template.childrenCount > 0) {
          const inheritance = template.prerender(_data);
          const data = Object.assign({}, inheritance, template.data);
          // Object.assign(data, {content: template.render(data)});
          console.log(template);
          data.history.unshift(template.content);
          return data;
        } else {
          const data = _data;
          Object.assign(data, template.data);
          // Object.assign(data, {content: template.render(data)});
          data.history = [template.content];
          return data;
        }
      })[0];
  }

  appendChild(template) {
    this.children.push(template);
    this.childrenCount++;
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
