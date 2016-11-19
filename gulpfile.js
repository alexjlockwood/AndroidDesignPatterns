// Require all the things
const gulp = require('gulp'),
    sass = require('gulp-sass'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    minifyCSS = require('gulp-clean-css'),
    prefixer = require('gulp-autoprefixer'),
    connect = require('gulp-connect');
cp = require('child_process');

// Set the path variables
const base_path = './',
    src = base_path + '_dev/src',
    dist = base_path + 'assets',
    paths = {  
    js: src + '/js/*.js',
    scss: [ src +'/sass/*.scss', 
	    src +'/sass/**/* .scss', 
	    src +'/sass/**/**/*.scss'],
    jekyll: ['index.html', '_posts/*', '_layouts/*', '_includes/*' , 'assets/*', 'assets/**/*']
};


// Compile sass to css
gulp.task('compile-sass', () => {  
	return gulp.src(paths.scss)
	.pipe(plumber((error) => {
		    gutil.log(gutil.colors.red(error.message));
		    gulp.task('compile-sass').emit('end');
		}))
	.pipe(sass())
	.pipe(prefixer('last 3 versions', 'ie 9'))
	.pipe(minifyCSS())
	.pipe(rename({dirname: dist + '/css'}))
	.pipe(gulp.dest('./'));
    });

// Rebuild Jekyll 
gulp.task('build-jekyll', (code) => {
	return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
	.on('error', (error) => gutil.log(gutil.colors.red(error.message)))
	.on('close', code);
    })

// Setup Server
    gulp.task('server', () => {
	    connect.server({
		    root: ['_site'],
		    port: 4000
		});
	})

// Watch files
    gulp.task('watch', () => {  
	    gulp.watch(paths.scss, ['compile-sass']);
	    gulp.watch(paths.jekyll, ['build-jekyll']);
	});

// Start Everything with the default task
gulp.task('default', [ 'compile-sass', 'build-jekyll', 'server', 'watch' ]);
