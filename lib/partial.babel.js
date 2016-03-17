import glob from 'glob';
import {createTemplates} from './helper';

const _event = new WeakMap();

export default class Component {
  constructor(pattern, opts = {}) {
    _event.set(this, {});
    const _glob = new glob.Glob(pattern);

    this.templates = createTemplates.call(this, _glob, opts, _event);
    this.pattern = pattern;
  }
}
