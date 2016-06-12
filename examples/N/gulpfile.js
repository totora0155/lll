const gulp = require('gulp');
const debug = require('gulp-debug');
const lll = require('../..');
const Component = lll.Component;
const News = require('./components/news');
const Entry = require('./components/entry');
const Post = require('./components/post');

gulp.task('build', () => {
  const templates = new Component('src/templates/**/*.html', {
    output: false
  });
  const bases = new Component('src/bases/**/*.html');
  const pages = new Component('src/pages/**/*.html', {
    base: 'src/pages',
    cache: false
  });
  const news = new News('src/news/*.md', {
    base: 'src',
    atom: 'global'
  });
  const entries = new Entry('src/entries/*.md', {
    base: 'src',
    atom: 'isolate'
  });
  const posts = new Post('src/posts/*.md', {
    base: 'src',
    atom: 'isolate'
  });

  lll(templates, bases, pages, news, entries, posts)
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
