import gulp from 'gulp';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';
import rename from 'gulp-rename';
import eslint from 'gulp-eslint';
import mocha from 'gulp-mocha';

{
  const src = 'lib/**/*.js';
  const dest = 'build/';

  gulp.task('babel', () => {
    gulp.src(src)
      .pipe(plumber())
      .pipe(babel())
      .pipe(rename((path) => {
        path.basename = path.basename.match(/^[^.]+/)[0];
      }))
      .pipe(gulp.dest(dest));
  });

  gulp.task('lint', () => {
    gulp.src(src)
      .pipe(eslint())
      .pipe(eslint.format())
  });
}

{
  const src = 'lib/**/*.js';
  gulp.task('watch', ['lint', 'babel'], () => {
    gulp.watch(src, ['babel']);
  });
}
