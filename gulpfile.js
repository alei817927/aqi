var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  notify = require('gulp-notify'),
  rename = require('gulp-rename'),
  del = require('del');
var jsDest = 'jquery.aqi.min.js';
gulp.task('clean', function (cb) {
  del([jsDest], cb)
});
gulp.task('default', ['clean'], function () {
  return gulp.src('jquery.aqi.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(uglify())
    .pipe(rename(jsDest))
    .pipe(gulp.dest('.'))
    .pipe(notify({ message: 'Scripts task complete' }));
});