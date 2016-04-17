import gulp from 'gulp';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';
import rename from 'gulp-rename';

{
  const src = 'lib/**/*.js';
  const dest = 'build/';

  gulp.task('babel', () => {
    gulp.src(src)
      .pipe(plumber())
      .pipe(babel())
      .pipe(rename(path => {
        path.basename = path.basename.match(/^[^.]+/)[0];
      }))
      .pipe(gulp.dest(dest));
  });
}

{
  const src = 'lib/**/*.js';
  gulp.task('watch', ['babel'], () => {
    gulp.watch(src, ['babel']);
  });
}
