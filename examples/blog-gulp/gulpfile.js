const gulp = require('gulp');
const debug = require('gulp-debug');
const lll = require('../..');
const Component = lll.Component;
const Entry = require('./components/entry');
const Post = require('./components/post');

gulp.task('build', () => {
  const bases = new Component('src/bases/**/*.html');
  const entries = new Entry('src/entries/*.md', {
    base: 'src/entries'
  });
  const posts = new Post('src/posts/*.md', {
    base: 'src/posts'
  });

  lll(bases, entries, posts)
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
