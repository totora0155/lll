const gulp = require('gulp');
const debug = require('gulp-debug');
const lll = require('../..');
const Component = lll.Component;
const Pages = require('./components/pages');

gulp.task('build', () => {
  const bases = new Component('src/bases/**/*.html');
  const pages = new Pages('src/pages/**/*.md', {
    base: 'src/pages'
  });

  lll(bases, pages)
    .then(stream => {
      stream
        .pipe(debug())
        .pipe(lll.dest('public'))
    })
    .catch(err => console.error(err));
});

gulp.task('watch', ['build'], () => {
  gulp.watch('src/**/*.+(html|md)', ['build']);
});
