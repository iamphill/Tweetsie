var gulp = require('gulp'),
   watch = require('gulp-watch'),
   babel = require('gulp-babel'),
   qunit = require('gulp-qunit');

gulp.task('watch', function () {
  watch('lib/*.js', function () {
    gulp.start('script');
  });
});

gulp.task('script', function () {
  gulp.src('lib/*.js')
      .pipe(babel())
      .pipe(gulp.dest('dist'))
});

gulp.task('test', function () {
  return gulp.src('./tests/index.html')
             .pipe(qunit());
});

gulp.task('default', ['watch']);
