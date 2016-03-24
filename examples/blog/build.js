const lll = require('../..');
const es = require('event-stream');
const vfs = require('vinyl-fs');
const marked = require('marked');
const divide = require('html-divide');
const groupFrom = require('group-from');
const _ = require('lodash');

const sidebar = new lll.Partial('src/partials/sidebar/*.html');
const base = new lll.Renderer('src/base.html');
const posts = new lll.Renderer('src/posts/**/*.md', {
  base: 'src',
  extname: '.html',
  cleanURL: true,
});
const category = new lll.Renderer('src/category/**/*.html', {
  base: 'src',
  cleanURL: true,
});
const entry = new lll.Renderer('src/entry.html');

const index = new lll.Renderer('src/index.html', {
  cleanURL: true,
});

category.on(lll.READY, () => {
  const basic = category.templates.categoryBase;
  const group = posts.state.categories;
  const templates = lll.Renderer.createTemplateWithBasic(basic, group);
  category.templates = templates;
});

posts.on(lll.WILL_RENDER, (contents) => {
  return marked(contents);
});

lll.all(entry, index).on(lll.WILL_RENDER, (contents, data) => {
  const postsClone = posts.clone();

  postsClone.state.categories.forEach((group) => {
    group.items.forEach((template) => {
      const dirname = template.file.dirname.replace('posts', 'category');
      template.file.dirname = dirname;
    });
  });
  data.state.posts = _.map(postsClone.templates, (template) => {
    return template;
  });
  data.state.categories = postsClone.state.categories;
  const divided = divide(contents);
  if (divided.breadclumb) {
    data.breadclumb = divided.breadclumb;
  }
  return divided.content;
});

lll(sidebar, base, entry, index, posts, category)
  .then((files) => {
    debugger;
    es.readArray(files)
      .pipe(vfs.dest('public'));
  })
  .catch((err) => {
    console.error(err);
  })

function getItems(templates) {
  const keys = Object.keys(templates);
  return keys.map((key) => {
    const t = posts.templates[key];
    return {
      title: t.title,
      body: t.headContents,
      url: t.url,
    };
  });
}

function getCategories(templates) {
  const grouped = groupFrom(templates, 'data.categories');
  return _.map(grouped, (items, name) => {
    return {items, name};
  });
}
