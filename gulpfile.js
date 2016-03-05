"use strict";
// Variables
var gulp = require('gulp');
var bower = require('gulp-bower');
var gulpif = require('gulp-if');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var cache = require('gulp-cached');
var del = require('del');
var connect = require('gulp-connect');
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


var basePaths = {
    src: 'src/',
    dest: 'dist/',
    dev: 'app/',
    temp: '.tmp/',
    bower: 'bower_components/'
};
var paths = {
    images: {
        src: basePaths.src + 'images/',
        temp: basePaths.temp + 'images/',
        dev: basePaths.dev + 'images/',
        dest: basePaths.dest + 'images/'
    },
    scripts: {
        src: basePaths.src + 'scripts/',
        temp: basePaths.temp + 'scripts/',
        dev: basePaths.dev + 'scripts/',
        dest: basePaths.dest + 'scripts/'
    },
    styles: {
        src: basePaths.src + 'scss/',
        temp: basePaths.temp + 'scss/',
        dev: basePaths.dev + 'styles/',
        dest: basePaths.dest + 'styles/'
    },
    fonts: {
        src: basePaths.bower + 'font-awesome/fonts/**.*',
        dest: basePaths.src + 'fonts/'
    }
};

// cache-t minden folyamatra applikalni rendesen
// onErrort buheralni - gutil message
// olvasni run-sequence hasznalatarol s kulonbozo folyamatokrol pl dist/dev agak egy folyamatban

// esetleg egy git push origin master kellene mar pl krisz miatt

// 5. css-regression test
// 7. google-pagespeed and karma jasmine / mocha testing for our files
// 8. fire up Angular

// upgrade gulptasks to separate files
// http://code.tutsplus.com/tutorials/the-right-way-to-retinafy-your-websites--net-31793 ++ retina for png and svg sprites also

// Clean up the mess
gulp.task('clean-up', function() {
    return del.sync(['app/**/*', '.tmp/**/*', 'src/**/*.map', 'src/fonts/**/*']);
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


// Handle FontAwesome
gulp.task('icons', function() { 
    return gulp.src('bower_components/font-awesome/fonts/**.*') 
        .pipe(gulp.dest('src/fonts/'))
        .pipe(notify({ message: "Fonts were copied", onLast: true })); 
});


// Handle all images
gulp.task('png-sprites', function () {
    return sprity.src({
        src: 'src/images/**/*.{png,jpg}',
        style: 'src/scss/sprites.scss',
        processor: 'sass',
    })
    .pipe(gulpif('*.png', gulp.dest('.tmp/images/'), gulp.dest('.tmp/scss/')));
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
        .pipe(gulp.dest('.'));
});
gulp.task('copy-img', ['png-sprites', 'svg-sprites'], function() { 
    return gulp.src('src/images/*.{gif,jpg,png,svg}') 
        .pipe(gulp.dest('.tmp/images/')); 
});
gulp.task('img-min', ['copy-img'], function() {
    return gulp.src('.tmp/images/*.{gif,jpg,png,svg}')
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            optimizationLevel: 6
        }))
        .pipe(gulp.dest('app/images/'))
        .pipe(notify({ message: "Image tasks were successful", onLast: true }));
});


// Handle stylesheets
gulp.task('copy-sass', function() { 
    return gulp.src('src/scss/**/*.scss') 
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
        .pipe(gulp.dest('app/styles'))
        .pipe(notify({ message: "CSS tasks were successful", onLast: true }));
});


// Handle scripts
gulp.task('script-lint', function() {
    return gulp.src('src/scripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});
gulp.task('concat-scripts', ['script-lint'], function() {
    return gulp.src('src/scripts/*.js')
        .pipe(cache('concat-scripts'))
        .pipe(concat('all.js'))
        .pipe(gulp.dest('.tmp/scripts'));
});
gulp.task('script-min', ['concat-scripts'], function() {
    return gulp.src('.tmp/scripts/all.js')
        .pipe(cache('uglify-script'))
        .pipe(sourcemaps.init())
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('app/scripts'))
        .pipe(notify({ message: "Script tasks were successful", onLast: true }));
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