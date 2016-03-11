const lll = require('../..');
const marked = require('marked');

const bases = new lll.Renderer('bases/**/*.html');
const ports = new lll.Renderer('posts/**/*.md');

ports.on(lll.WILL_RENDER, (content) => {
  return marked(content);
});

lll(bases, ports)
  .then((contents) => {
    console.log(contents);
  })
