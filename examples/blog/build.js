const lll = require('../..');
const es = require('event-stream');
const vfs = require('vinyl-fs');
const marked = require('marked');
const divide = require('html-divide');

const base = new lll.Renderer('src/base.html');
const posts = new lll.Renderer('src/posts/**/*.md', {
  base: 'src',
  extname: '.html',
  cleanURL: true,
});
const entry = new lll.Renderer('src/entry.html');
const index = new lll.Renderer('src/index.html', {
  cleanURL: true,
});

posts.on(lll.WILL_RENDER, (contents) => {
  return marked(contents);
});

entry.on(lll.WILL_RENDER, ((posts, contents, data) => {
  data.items = getItems(posts.templates);
  const divided = divide(contents);
  data.breadclumb = divided.breadclumb;
  data.side = divided.side;
  return divided.content;
}).bind(null, posts));

index.on(lll.WILL_RENDER, ((posts, contents, data) => {
  data.items = getItems(posts.templates);
  const divided = divide(contents);
  data.side = divided.side;
  return divided.content;
}).bind(null, posts));

lll(base, posts, entry, index)
  .then((files) => {
    debugger;
    es.readArray(files)
      .pipe(vfs.dest('public'));
  })
  .catch((err) => {
    console.error(err);
  })

function getItems(templates) {
  const keys = Object.keys(posts.templates);
  return keys.map((key) => {
    const t = posts.templates[key];
    return {
      title: t.data.title,
      body: t.contents.slice(0, t.contents.indexOf('<!-- more -->')),
      url: '/' + t.file.relative,
    };
  });
}
