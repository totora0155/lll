import config from './config';

export default class TemplateData {
  constructor(obj) {
    Object.assign(this, obj);
    this.contents = '';
  }

  get sitename() {
    return this.config.sitename || '';
  }

  get pageTitle() {
    return this.template.pageTitle || config.sitename;
  }

  get title() {
    return this.template.title || config.sitename;
  }

  get url() {
    return this.template.url || config.siteurl;
  }

  get relativePath() {
    return this.template.file.relative || '/';
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

  get atomId() {
    return this.config.atomId || '';
  }
}
