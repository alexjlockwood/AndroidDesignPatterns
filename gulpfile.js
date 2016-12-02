const gulp = require('gulp'),
  gp_rename = require('gulp-rename'),
  gp_webpack = require('webpack-stream'),
  gp_uglify = require('gulp-uglify'),
  gp_concat = require('gulp-concat'),
  gp_pump = require('pump'),
  gp_childProcess = require('child_process'),
  gp_less = require('gulp-less'),
  gp_cleanCSS = require('gulp-clean-css'),
  gp_path = require('path');

gulp.task('default', ['less', 'js', 'serve']);

gulp.task('less', function() {
  return gulp.src('_less/style.less')
    .pipe(gp_less())
    .pipe(gulp.dest('_includes'))
    .pipe(gp_cleanCSS())
    .pipe(gp_rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('_includes'));
});

gulp.task('js', function() {
  return gulp.src('_js/src/**/*.js')
    .pipe(gp_concat('concat.js'))
    .pipe(gulp.dest('_js/build'))
    .pipe(gp_webpack({
      output: {
        path: __dirname,
        filename: "all.js"
      },
      module: {
        loaders: []
      }
    }))
    .pipe(gp_uglify())
    .pipe(gp_rename({ extname: '.min.js' }))
    .pipe(gulp.dest('scripts'));
});

gulp.task('serve', function(done) {
  return gp_childProcess.spawn(
    'bundle',
    ['exec', 'jekyll', 'serve', '--baseurl=', '--incremental'],
    { stdio: 'inherit' })
  .on('close', done);
});
