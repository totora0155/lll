const lll = require('../..');
const Component = lll.Component;
const Pages = require('./components/pages');

const bases = new Component('src/bases/**/*.html');
const pages = new Pages('src/pages/**/*.md', {
  base: 'src/pages',
  watch: true
});

console.log(pages);

lll(bases, pages)
  .then(stream => stream.pipe(lll.dest('public')))
  .catch(err => console.error(err));
