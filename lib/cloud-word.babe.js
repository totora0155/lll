import path from 'path';
import File from 'vinyl';

export default class CloudWord {
  constructor(cloudName, word, data, opts) {
    this.cloudName = cloudName;
    this.name = `${cloudName}:${word}`;
    this.word = word;
    this.data = Object.assign({}, data, {
      title: (() => {
        if (word === 'index') {
          if (opts.cloud) {
            if (typeof opts.cloud.title === 'function') {
              return opts.cloud.title(cloudName);
            }
          }
          return opts.cloud.title;
        }
        return word;
      })()
    });
    this.opts = Object.assign({}, opts);
    this.count = 1;
    this.items = [];
  }

  get title() {
    return this.data.title;
  }

  get contents() {
    return this.file.contents.toString();
  }

  get url() {
    return this.file.relative;
  }

  createFile(contents) {
    const base = path.resolve(this.opts.base);
    const dirname = `${path.resolve(this.opts.dirname)}/${this.cloudName}`;
    const filePath = `${dirname}/${this.word}${this.opts.extname}`;
    this.file = new File({
      base,
      path: filePath,
      contents: new Buffer(contents)
    });
  }
}
