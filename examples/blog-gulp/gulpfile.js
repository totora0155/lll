const gulp = require('gulp');
const debug = require('gulp-debug');
const lll = require('../..');
const Component = lll.Component;
const Entry = require('./components/entry');
const Post = require('./components/post');
const Test = require('./components/test');

gulp.task('build', () => {
  const templates = new Component('src/templates/**/*.html', {
    output: false
  });
  const bases = new Component('src/bases/**/*.html');
  const tags = new Component('src/tags/index.html', {
    base: 'src'
  });
  const entries = new Entry('src/entries/*.md', {
    base: 'src'
  });
  const posts = new Post('src/posts/*.md', {
    base: 'src'
  });
  const tests = new Test('src/tests/*.md', {
    base: 'src'
  });

  // lll(templates, bases, entries)
  lll(templates, bases, tags, entries, posts, tests)
    .then(stream => {
      stream
        .pipe(debug())
        .pipe(lll.dest('public'));
    })
    .catch(err => console.error(err));
});

gulp.task('watch', ['build'], () => {
  gulp.watch('src/**/*.+(html|md)', ['build']);
});
