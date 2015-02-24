var gulp = require('gulp'),
   watch = require('gulp-watch'),
   babel = require('gulp-babel');

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

gulp.task('default', ['watch']);
