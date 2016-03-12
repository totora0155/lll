const lll = require('../..');
const marked = require('marked');
const divide = require('html-divide');

const bases = new lll.Renderer('bases/**/*.html');
const ports = new lll.Renderer('posts/**/*.md', {
  extname: '.html',
  dest: 'build',
});

bases.on(lll.WILL_RENDER, (content, data) => {
  const divided = divide(content);
  if (divided.header) {
    data.header = divided.header;
  }
  return divided.content;
});

ports.on(lll.WILL_RENDER, (content) => {
  return marked(content);
});

lll(bases, ports)
  .then((files) => {
    files.forEach(f => console.log(f.path))
  })
