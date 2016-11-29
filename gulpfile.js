const gulp = require('gulp'),
    sass = require('gulp-sass'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    minifyCSS = require('gulp-clean-css'),
    prefixer = require('gulp-autoprefixer'),
    connect = require('gulp-connect'),
    webpack = require('webpack-stream'),
    uglify = require('gulp-uglify'),
    pump = require('pump'),
    cp = require('child_process');

const base_path = './',
  src = base_path + '_dev/src',
  dist = base_path + 'assets',
  paths = {
    js: src + '/js/*.js',
    scss: [src + '/sass/*.scss',
      src + '/sass/**/* .scss',
      src + '/sass/**/**/*.scss'
    ],
    jekyll: ['index.html', '_posts/*', '_layouts/*', '_includes/*', 'assets/*', 'assets/**/*']
  };


// Compile sass to css
/*
gulp.task('compile-sass', function() {
  return gulp.src(paths.scss)
    .pipe(plumber(function(error) {
      gutil.log(gutil.colors.red(error.message));
      gulp.task('compile-sass').emit('end');
    }))
    .pipe(sass())
    .pipe(prefixer('last 3 versions', 'ie 9'))
    .pipe(minifyCSS())
    .pipe(rename({ dirname: dist + '/css' }))
    .pipe(gulp.dest('./'));
});

// Rebuild Jekyll 
gulp.task('build-jekyll', function(code) {
  return cp.spawn('jekyll', ['build'], { stdio: 'inherit' })
    .on('error', function(error) { gutil.log(gutil.colors.red(error.message)) })
    .on('close', code);
})

// Setup Server
gulp.task('server', function() {
  connect.server({
    root: ['_site'],
    port: 4000
  });
})


// Watch files
gulp.task('watch', function() {
  gulp.watch(paths.scss, ['compile-sass']);
  gulp.watch(paths.jekyll, ['build-jekyll']);
});
*/

// Start Everything with the default task
gulp.task('default', ['js', 'serve']);

gulp.task('js', function() {
  return gulp.src('./scripts/posts/2016/11/29/animated-icon-demos.js')
      .pipe(webpack(require('./webpack.config.js')))
      .pipe(gulp.dest('./scripts'))
      .pipe(uglify())
      .pipe(rename({extname: '.min.js'}))
      .pipe(gulp.dest('./scripts'));
});

gulp.task('serve', function(done) {
	return cp.spawn('bundle', ['exec', 'jekyll', 'serve', '--baseurl=', '--incremental'], {stdio: 'inherit'}).on('close', done);
});
