import glob from 'glob';
import {createTemplates} from './helper';
import eventType from './event-type';

export default class Partial {
  constructor(pattern, opts = {}) {
    this.templates = createTemplates.call(this, new glob.Glob(pattern));
    this.pattern = pattern;
    this.opts = opts;
    this.event = {};
  }

  ready() {
    const handles = this.event[eventType.READY];
    if (handles && Array.isArray(handles)) {
      handles.forEach((handle) => {
        return handle.call(this);
      });
    }
  }
}
