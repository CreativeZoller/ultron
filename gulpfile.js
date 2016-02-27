'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
var csslint = require('gulp-csslint');
var csscomb = require('gulp-csscomb');
var base64  = require('gulp-base64');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var duration = require('gulp-duration');
var cache = require('gulp-cached');
var clean  = require('gulp-clean');
var copy   = require('gulp-contrib-copy');
var connect = require('gulp-connect');

// Variables
var src = {
    scriptSources: 'scripts/',
    sassSources: 'scss/'
};
var dest = {
    scriptCompiles: 'dist/scripts/',
    stylecompiles: 'dist/styles/'
};


// Clean up
gulp.task('clean', function() {
	return gulp.src(['dist/*.html', 'dist/scripts/*.js', 'dist/styles/*.css', 'scripts/*.map', 'styles/*.map', 'dist/**/*.map'])
		.pipe(clean());
});
gulp.task('clean-cache', function () {  // why error???
    return cache.clearAll();
});

// Create stylesheets
gulp.task('sass', function() {
    return gulp.src('scss/*.scss')
        .pipe(cache('sass'))
        .pipe(sass())
        .pipe(gulp.dest('dist/styles'));
});
gulp.task('prefix', ['sass'], function () {
    return gulp.src('dist/styles/*.css')
        .pipe(cache('prefix'))
        .pipe(autoprefixer({
            browsers: ['> 10%', 'last 2 Chrome versions', 'last 2 Firefox versions', 'last 2 Opera versions', 'last 2 Safari versions', 'not ie <= 10'],
            cascade: false
        }))
        .pipe(csscomb({
            config: 'csscomb.json'
        }))
        .pipe(base64())
        .pipe(gulp.dest('dist'));
});
gulp.task('css-lint', ['prefix'], function() {
    return gulp.src(['dist/styles/*.css', '!dist/styles/*.min.css'])
        .pipe(csslint())
        .pipe(csslint.reporter());
});
gulp.task('css-min', ['css-lint'], function () {
    return gulp.src('dist/styles/*.css')
        .pipe(sourcemaps.init())
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/styles'));
});


// Creating scripts
gulp.task('script-lint', function() {
    return gulp.src('scripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
});
gulp.task('concat-scripts', ['script-lint'], function() {
    return gulp.src('scripts/*.js')
        .pipe(cache('concat-scripts'))
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/scripts'));
});
gulp.task('uglify-script', ['concat-scripts'], function() {
    return gulp.src('dist/scripts/all.js')
        .pipe(cache('uglify-script'))
        .pipe(sourcemaps.init())
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/scripts'));
});


// Copy index
gulp.task('copy', function() {
	return gulp.src('*.html')
		.pipe(copy())
		.pipe(gulp.dest('dist'));
});


// Watch tasks
gulp.task('watch', function() {
    gulp.watch('scripts/*.js', ['lint', 'uglify-script']);
    gulp.watch('scss/*.scss', ['sass']);
});


// Webserver tasks
gulp.task('webserver', function() {
    return connect.server({
        root: 'dist',
        livereload: true
    });
});


// TODOS: optimize the tasks clean and build, websever and watch
// gulp-imagemin and sprity for pngs
// gulp-util to make output fancier
// google-pagespeed and karma jasmine / mocha testing for our files
// adding Mustache tasks
// fire up Angular
gulp.task('build', ['clean', 'css-min', 'uglify-script', 'copy']);
gulp.task('launch', ['webserver', 'watch']);