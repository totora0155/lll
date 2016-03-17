const lll = require('../..');
const es = require('event-stream');
const vfs = require('vinyl-fs');
const marked = require('marked');
const divide = require('html-divide');
const _ = require('lodash');

const sidebar = new lll.Partial('src/components/sidebar/**/*.html');
const base = new lll.Renderer('src/base.html');

// base.on(lll.READY, (base) => {
// });
// const posts = new lll.Renderer('src/posts/**/*.md', {
//   base: 'src',
//   extname: '.html',
//   cleanURL: true,
// });
// const categories = new lll.Renderer('src/categories/**/*.html', {
//   base: 'src',
//   cleanURL: true,
// });
// const entry = new lll.Renderer('src/entry.html');

const index = new lll.Renderer('src/index.html', {
  cleanURL: true,
});

// categories.on(lll.READY, (categories) => {
//   const grouped = _.groupBy(posts.templates, (template) => {
//     return template.data.category;
//   });
//
//   const basic = categories.templates.categoryBase;
//   const templates = lll.Renderer.createTemplateWithBasic(basic, grouped);
//   categories.templates = templates;
// });
//
// categories.on(lll.WILL_RENDER, (contents, data) => {
//   data.items = _.map(data.items, (item) => {
//     return {
//       title: item.data.title,
//     };
//   });
//   return contents;
// });

// posts.on(lll.WILL_RENDER, (contents) => {
//   return marked(contents);
// });

// lll.all(entry, index).on(lll.WILL_RENDER, ((posts, contents, data) => {
index.on(lll.WILL_RENDER, (contents, data) => {
  // data.items = getItems(posts.templates);
  // data.categories = getCategories(posts.templates);
  // data.categorieNames = Object.keys(data.categories);
  // const divided = divide(contents);
  // data.side = divided.side;
  // if (divided.breadclumb) {
  //   data.breadclumb = divided.breadclumb;
  // }
  // return divided.content;
  return contents;
});

// lll(base, posts, entry, index, categories)
lll(sidebar, base, index)
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
      title: t.data.title,
      body: t.contents.slice(0, t.contents.indexOf('<!-- more -->')),
      url: '/' + t.file.relative,
    };
  });
}

function getCategories(templates) {
  return _.groupBy(templates, (template) => {
    return template.data.category;
  });
}