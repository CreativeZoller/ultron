'use strict';

var gulp = require('gulp');
var bower = require('gulp-bower');
var gulpif = require('gulp-if');
var rename = require('gulp-rename');
//var plumber = require('gulp-plumber');
var notify = require("gulp-notify");
var jshint = require('gulp-jshint');
var imagemin = require('gulp-imagemin');
var sprity = require('sprity');
var svgSprite = require('gulp-svg-sprite');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
var csslint = require('gulp-csslint');
var csscomb = require('gulp-csscomb');
var base64  = require('gulp-base64');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var cache = require('gulp-cached');
var clean  = require('gulp-clean');
var connect = require('gulp-connect');

var duration = require('gulp-duration');
var copy   = require('gulp-contrib-copy');

// Variables
var config = {
    bowerDir: 'bower_components',
     base: '.',
    baseTemp: '.tmp/',
    baseDepl: 'dist/',  // deployment
    baseApp: 'app/',    // development
    srcScripts: 'src/scripts/',
    srcStyles: 'src/scss/',
    srcImages: 'src/images/',
    srcFonts: 'src/fonts/',
    tempScripts: '.tmp/scripts/',
    tempStyles: '.tmp/scss/',
    tempImages: '.tmp/images/',
    deplScripts: 'dist/scripts/',
    deplStyles: 'dist/styles/',
    deplImages: 'dist/images/',
    deplFonts: 'dist/fonts/',
    appScripts: 'app/scripts/',
    appStyles: 'app/styles/',
    appImages: 'app/images/',
    appFonts: 'app/fonts/'
};

// onErrort buheralni, majd copy tasket lecserelni mindenhol sima .pipe-ra
// olvasni run-sequence hasznalatarol s kulonbozo folyamatokrol pl dist/dev agak egy folyamatban

// 5. css-regression test
// 7. google-pagespeed and karma jasmine / mocha testing for our files
// 8. fire up Angular

// upgrade gulptasks to separate files
// http://code.tutsplus.com/tutorials/the-right-way-to-retinafy-your-websites--net-31793 ++ retina for png and svg sprites also

// Clean up the mess
gulp.task('clean-up', function() {
	return gulp.src(['app/**/*', '.tmp/**/*', 'src/**/*.map', 'src/fonts/**/*'], {read: false, force: true})
		.pipe(clean()
            /*.on('error', notify.onError({ message: "Cleaning failed"}))
            .on('error', notify.onError(function (error) {
                return "Error occured: " + error.message;
            }))*/ 
        )
        .pipe(notify({ message: "Cleaning was successful", onLast: true }));
});
gulp.task('clean-cache', function () {  // why error???
    return cache.clearAll();
});


// Init the bower install command
// upgrade with bower prum like install.sh call
gulp.task('bower', function() { 
    return bower()
         .pipe(gulp.dest('bower_components/')) 
        .pipe(notify({ message: "Bower installation was successful", onLast: true }));
});


// Handle all images
gulp.task('png-sprites', function () {
    return sprity.src({
        src: 'src/images/**/*.{png,jpg}',
        style: 'src/scss/sprites.scss',
        processor: 'sass',
    })
    .pipe(gulpif('*.png', gulp.dest('.tmp/images/'), gulp.dest('.tmp/scss/')))
    .pipe(notify({ message: "PNG-sprites were created", onLast: true }));
});
gulp.task('svg-sprites', function() {
    var config = {
        dest : '.',
        shape : {
            dimension : {
                maxWidth: 128,
                maxHeight: 128
            },
            spacing: {
                padding: 10
            }
        },
        mode : {
            css : {
                dest : '.',
                sprite : '.tmp/images/sprites.svg',
                render : {
                    scss : {
                        dest : '.tmp/scss/svg_sprites.scss'
                    }
                },
            }
        }
    };
    return gulp.src('src/images/**/*.svg')
        .pipe(svgSprite(config))
        .pipe(gulp.dest('.'))
        .pipe(notify({ message: "SVG-sprites were created", onLast: true }));
});
gulp.task('copy-img', ['png-sprites', 'svg-sprites'], function() {  // options to be implemented ??
    return gulp.src('src/images/*.{gif,jpg,png,svg}')
        .pipe(copy())
        .pipe(gulp.dest('.tmp/images'));
});
gulp.task('img-min', ['copy-img'], function() {
    return gulp.src('.tmp/images/*.{gif,jpg,png,svg}')
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            optimizationLevel: 6
        }))
        .pipe(gulp.dest('app/images/'))
        .pipe(notify({ message: "Image minifying was successful", onLast: true }));
});


// Handle FontAwesome
gulp.task('icons', function() { 
    return gulp.src('bower_components/font-awesome/fonts/**.*') 
        .pipe(gulp.dest('src/fonts/'))
        .pipe(notify({ message: "Fonts were copied", onLast: true })); 
});


// Handle stylesheets
gulp.task('copy-sass', function() {
    return gulp.src('src/scss/**/*.scss')
        .pipe(copy())
        .pipe(gulp.dest('.tmp/scss/'));
});
gulp.task('sass', ['copy-sass'], function() {
    return gulp.src('.tmp/scss/*.scss')
        .pipe(cache('sass'))
        .pipe(sass())
        .pipe(gulp.dest('.tmp/scss'));
});
gulp.task('prefix', ['sass'], function () {
    return gulp.src(['.tmp/scss/*.css', '!.tmp/scss/bootstrap.css', '!.tmp/scss/*.min.css'])
        .pipe(cache('prefix'))
        .pipe(autoprefixer({
            browsers: ['> 10%', 'last 2 Chrome versions', 'last 2 Firefox versions', 'last 2 Opera versions', 'last 2 Safari versions', 'not ie <= 10'],
            cascade: false
        }))
        .pipe(csscomb({
            config: 'csscomb.json'
        }))
        .pipe(base64())
        .pipe(gulp.dest('.tmp/scss'));
});
gulp.task('css-lint', ['prefix'], function() {
    return gulp.src(['.tmp/scss/*.css', '!.tmp/scss/*.min.css', '!.tmp/scss/bootstrap.css','!.tmp/scss/fontawesome.css'])
        .pipe(csslint())
        .pipe(csslint.reporter());
});
gulp.task('css-min', ['css-lint'], function () {
    return gulp.src(['.tmp/scss/*.css', '!.tmp/scss/*.min.css'])
        .pipe(sourcemaps.init())
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('app/styles'));
});


// Handle scripts
gulp.task('script-lint', function() {
    return gulp.src('src/scripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(notify({ message: "Linting the scripts was successful", onLast: true }));
});
gulp.task('concat-scripts', ['script-lint'], function() {
    return gulp.src('src/scripts/*.js')
        .pipe(cache('concat-scripts'))
        .pipe(concat('all.js'))
        .pipe(gulp.dest('.tmp/scripts'))
        .pipe(notify({ message: "Merging scripts was successful", onLast: true }));
});
gulp.task('script-min', ['concat-scripts'], function() {
    return gulp.src('.tmp/scripts/all.js')
        .pipe(cache('uglify-script'))
        .pipe(sourcemaps.init())
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('app/scripts'))
        .pipe(notify({ message: "Script-minifying was successful", onLast: true }));
});


// Watch tasks
gulp.task('watch', function() {
    gulp.watch('src/scripts/*.js', ['script-min']);
    gulp.watch('src/scss/*.scss', ['css-min']);
});


// Webserver tasks
gulp.task('webserver', function() {
    return connect.server({
        root: 'app',
        livereload: true
    });
});


gulp.task('build', ['clean-up', 'image-min', 'css-min', 'script-min']);
gulp.task('launch', ['webserver', 'watch']);