export default class TemplateData {
  constructor(obj) {
    Object.assign(this, obj);
  }

  get sitename() {
    return this.config.sitename || null;
  }

  get title() {
    return this.template.title || null;
  }

  get url() {
    return this.template.url || null;
  }

  get relativePath() {
    return this.template.file.relative || null;
  }

  get items() {
    return this.template.data.items || [];
  }

  get prevItem() {
    return this.template.rel.prev || null;
  }

  get nextItem() {
    return this.template.rel.next || null;
  }

  get prevPage() {
    return this.template.page.prev || null;
  }

  get nextPage() {
    return this.template.page.next || null;
  }
}
