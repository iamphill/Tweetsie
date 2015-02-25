var gulp = require('gulp'),
   watch = require('gulp-watch'),
   babel = require('gulp-babel'),
   qunit = require('gulp-qunit'),
  uglify = require('gulp-uglify'),
  rename = require("gulp-rename"),
runSequence = require('run-sequence'),
  header = require('gulp-header'),
     pkg = require('./package.json'),
   clean = require('gulp-clean');

var banner = ['/**',
              ' * <%= pkg.name %> - <%= pkg.description %>',
              ' * @version v<%= pkg.version %>',
              ' * @author <%= pkg.author %>',
              ' * @license <%= pkg.license %>',
              ' */',
              ''].join('\n');

gulp.task('watch', function () {
  watch('lib/*.js', function () {
    runSequence('cleandist', 'script', 'compress', 'banner');
  });
});

gulp.task('script', function () {
  return gulp.src('lib/*.js')
             .pipe(babel())
             .pipe(gulp.dest('dist'))
});

gulp.task('compress', function() {
  return gulp.src('dist/Tweetsie.js')
             .pipe(uglify())
             .pipe(rename({
               suffix: '.min'
             }))
             .pipe(gulp.dest('dist'))
});

gulp.task('banner', function () {
  return gulp.src('dist/*.js')
             .pipe(header(banner, {
               pkg: pkg
             }))
             .pipe(gulp.dest('dist'));
});

gulp.task('cleandist', function () {
  return gulp.src('dist/*.js', {
    read: false
  }).pipe(clean());
});

gulp.task('test', function () {
  return gulp.src('./tests/index.html')
             .pipe(qunit());
});

gulp.task('default', ['watch']);
