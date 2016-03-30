const lll = require('../..');
const _ = require('lodash');
const marked = require('marked');
const divide = require('html-divide');
// TODO
const vfs = require('vinyl-fs');
const es = require('event-stream');

const sidebar = new lll.Partial('src/partials/sidebar/*.html');
const base = new lll.Renderer('src/base.html');
const entry = new lll.Renderer('src/entry.html');
const index = new lll.Renderer('src/index.html');
const posts = new lll.Renderer('src/posts/**/*.md', {
  base: 'src',
  sort: ['qux', 'baz', 'bar', 'foo'],
});
const category = new lll.Renderer('src/category/**/*.html', {
  base: 'src',
});

index.on(lll.WILL_RENDER, (contents, data) => {
  data.items = posts.templates;
  return contents;
});

lll.all(entry, index).on(lll.WILL_RENDER, (contents, data) => {
  data.state.posts = posts.templates;
  data.state.categories = posts.state.categories;
  const divided = divide(contents);
  if (divided.breadclumb) {
    data.breadclumb = divided.breadclumb;
  }
  return divided.content;
});

category.on(lll.READY, function () {
  const basic = this.getTemplateByName('categoryBase');
  const groups = posts.state.categories;
  const templates = lll.Renderer.createTemplateWithBasic(basic, groups);
  this.templates = templates;
});

posts.on(lll.WILL_RENDER, marked);

lll(sidebar, base, entry, index, posts, category)
  .then((files) => {
    debugger;
    es.readArray(files)
      .pipe(vfs.dest('public'));
  })
  .catch((err) => {
    console.error(err);
  })
