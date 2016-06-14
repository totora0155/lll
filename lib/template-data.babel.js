import fs from 'fs';
import _ from 'lodash';
import config from './config';

export default class TemplateData {
  constructor(obj) {
    Object.assign(this, obj);
    this.contents = '';
  }

  get ogpPrefix() {
    return [
      'og: http://ogp.me/ns# ',
      'fb: http://ogp.me/ns/fb# ',
      'article: http://ogp.me/ns/article#'
    ].join('');
  }

  ogp(data) {
    const template = fs.readFileSync('./templates/ogp.html', 'utf-8');
    return _.template(template)(Object.assign({
      sitename: this.sitename,
      title: this.pageTitle,
      summary: this.summary,
      eyecatchingURL: this.eyecatchingURL,
      url: this.url,
    }, data));
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

  get eyecatchingURL() {
    return ''
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
