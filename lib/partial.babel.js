import glob from 'glob';
import {createTemplates} from './helper';

const _event = new WeakMap();

export default class Partial {
  constructor(pattern, opts = {}) {
    this.templates = createTemplates.call(this, new glob.Glob(pattern));
    this.pattern = pattern;
    this.opts = opts;
    this.event = {};
  }
}
