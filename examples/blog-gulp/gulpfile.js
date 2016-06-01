const gulp = require('gulp');
const debug = require('gulp-debug');
const lll = require('../..');
const Component = lll.Component;
const Entry = require('./components/entry');
const Post = require('./componentes/post');

gulp.task('build', () => {
  const bases = new Component('src/bases/**/*.html');
  const Entry = new Entry('src/entrys/*.md', {
    base: 'src/entries'
  });
  const posts = new Pages('src/posts/*.md', {
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
