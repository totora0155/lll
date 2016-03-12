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

const list = new lll.Renderer('src/list.html', {
  cleanURL: true,
});

entry.on(lll.WILL_RENDER, (content, data) => {
  const divided = divide(content);
  if (divided.header) {
    data.header = divided.header;
  }
  return divided.content;
});

posts.on(lll.WILL_RENDER, (content) => {
  return marked(content);
});

list.on(lll.WILL_RENDER, ((posts, content, data) => {
  const keys = Object.keys(posts.templates);
  data.items = keys.map(key => {
    const t = posts.templates[key];
    return {
      title: t.data.title,
      body: t.contents.slice(0, t.contents.indexOf('<!-- more -->')),
    };
  });
  return content;
}).bind(null, posts));

lll(base, posts, entry, list)
  .then((files) => {
    es.readArray(files)
      .pipe(vfs.dest('build'));
  })
