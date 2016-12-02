const gulp = require('gulp');
const webpack = require('webpack-stream');
const gp_childProcess = require('child_process');
const $ = require('gulp-load-plugins')({'camelize': true});

gulp.task('default', ['less', 'js', 'serve']);

gulp.task('less', function() {
  return gulp.src('_less/style.less')
    .pipe($.less())
    .pipe(gulp.dest('_includes'))
    .pipe($.cleanCss())
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('_includes'));
});

gulp.task('js', function() {
  return gulp.src('_js/src/**/*.js')
    .pipe($.concat('concat.js'))
    .pipe(gulp.dest('_js/build'))
    .pipe(webpack({
      output: {
        path: __dirname,
        filename: "all.js"
      },
      module: {
        loaders: []
      }
    }))
    .pipe($.uglify())
    .pipe($.rename({ extname: '.min.js' }))
    .pipe(gulp.dest('scripts'));
});

gulp.task('serve', function(done) {
  return gp_childProcess.spawn(
    'bundle',
    ['exec', 'jekyll', 'serve', '--baseurl=', '--incremental'],
    { stdio: 'inherit' })
  .on('close', done);
});
