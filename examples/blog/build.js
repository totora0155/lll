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
});
const category = new lll.Renderer('src/category/**/*.html', {
  base: 'src',
});

lll.all(entry, index).on(lll.WILL_RENDER, (contents, data) => {
  const postsClone = posts.clone();

  postsClone.state.categories.forEach((group) => {
    group.items.forEach((template) => {
      const dirname = template.file.dirname.replace('posts', 'category');
      template.file.dirname = dirname;
    });
  });
  data.state.posts = _.map(posts.templates, (template) => {
    return template;
  });
  data.state.categories = postsClone.state.categories;
  const divided = divide(contents);
  if (divided.breadclumb) {
    data.breadclumb = divided.breadclumb;
  }
  return divided.content;
});

category.on(lll.READY, () => {
  const basic = category.templates.categoryBase;
  const group = posts.state.categories;
  const templates = lll.Renderer.createTemplateWithBasic(basic, group);
  category.templates = templates;
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
