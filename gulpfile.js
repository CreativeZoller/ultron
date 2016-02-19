// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var clean  = require('gulp-clean');
var copy   = require('gulp-contrib-copy');
var connect = require('gulp-connect');

// Clean task
gulp.task('clean', function() {
	return gulp.src(['dist/*.html', 'dist/scripts/*.js', 'dist/styles/*.css'])
		.pipe(clean());
});

// Lint Task
gulp.task('lint', function() {
    return gulp.src('scripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src('scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('dist/styles'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src('scripts/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/scripts'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'));
});

// Copy task
gulp.task('copy', function() {
	return gulp.src('*.html')
		.pipe(copy())
		.pipe(gulp.dest('dist'));
});

gulp.task('webserver', function() {
	return connect.server({
		root: 'dist',
		livereload: true/*,
		host: '0.0.0.0',
		open: 'dist/index.html'*/
	});
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('scripts/*.js', ['lint', 'scripts']);
    gulp.watch('scss/*.scss', ['sass']);
});

// Tasks
gulp.task('build', ['clean', 'lint', 'sass', 'copy', 'scripts']);
gulp.task('default', ['build', 'webserver', 'watch']);