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
const categories = new lll.Renderer('src/categories/**/*.html', {
  base: 'src',
  cleanURL: true,
});
const entry = new lll.Renderer('src/entry.html');

const index = new lll.Renderer('src/index.html', {
  cleanURL: true,
});

categories.on(lll.READY, () => {
  const basic = categories.templates.categoryBase;
  const group = posts.state.categories;
  const templates = lll.Renderer.createTemplateWithBasic(basic, group);
  categories.templates = templates;
});

categories.on(lll.WILL_RENDER, (contents, data) => {
  data.items = _.map(data.items, (item) => {
    return {
      title: item.data.title,
    };
  });
  return contents;
});

posts.on(lll.WILL_RENDER, (contents) => {
  return marked(contents);
});

lll.all(entry, index).on(lll.WILL_RENDER, ((posts, contents, data) => {
  data.items = getItems(posts.templates);
  data.categories = getCategories(posts.templates);
  const divided = divide(contents);
  if (divided.breadclumb) {
    data.breadclumb = divided.breadclumb;
  }
  return divided.content;
}).bind(null, posts));

lll(sidebar, base, posts, entry, index, categories)
// lll(sidebar, base, posts, entry, index)
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
