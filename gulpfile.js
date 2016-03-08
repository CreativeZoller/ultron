"use strict";
// Variables
var gulp = require('gulp');
var bower = require('gulp-bower');
var gulpif = require('gulp-if');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var cache = require('gulp-cached');
var del = require('del');
var runSequence = require('run-sequence');
var connect = require('gulp-connect');
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

var isProduction = true;
if(gutil.env.dev === true) isProduction = false;
var changeEvent = function(evt) {
    gutil.log('File', gutil.colors.cyan(evt.path.replace(new RegExp('/.*(?=/' + basePaths.src + ')/'), '')), 'was', gutil.colors.magenta(evt.type));
};

var basePaths = {
    src: 'src/',
    prod: 'dist/',
    dev: 'app/',
    temp: '.tmp/',
    bower: 'bower_components/'
};
var paths = {
    images: {
        src: basePaths.src + 'images/',
        temp: basePaths.temp + 'images/',
        dev: basePaths.dev + 'images/',
        prod: basePaths.prod + 'images/'
    },
    scripts: {
        src: basePaths.src + 'scripts/',
        temp: basePaths.temp + 'scripts/',
        dev: basePaths.dev + 'scripts/',
        prod: basePaths.prod + 'scripts/'
    },
    styles: {
        src: basePaths.src + 'scss/',
        temp: basePaths.temp + 'scss/',
        dev: basePaths.dev + 'styles/',
        prod: basePaths.prod + 'styles/'
    },
    fonts: {
        src: basePaths.bower + 'font-awesome/fonts/**.*',
        prod: basePaths.src + 'fonts/'
    }
};

/*
    npm prune - uninstall not used modules
    rm -rf node_modules .. npm install - un and reinstall all local modules
    bower prune - uninstall unused packages
*/


// W.I.P. fix runSequences, modify connect and watch to use browser-reload
// making readme, git push original
// 5. css-regression test
// 7. google-pagespeed and karma jasmine / mocha testing for our files + variable usage and separated gulp files
// 8. fire up Angular
// gulp-svg2png and gulp-svgo to upgrade svg-sprites with fallback
// http://code.tutsplus.com/tutorials/the-right-way-to-retinafy-your-websites--net-31793 ++ retina for png and svg sprites also

// Clean up the mess
gulp.task('cleanUp', ['cleanCache'], function() {
    return del(['app/**/*', 'dist/**/*', '.tmp/**/*', 'src/**/*.map', 'src/fonts/**/*']);
});
gulp.task('cleanCache', function () {
    return cache.caches = {};
});


// Init the bower install command
gulp.task('bower', function() { 
    return bower()
         .pipe(gulp.dest('bower_components/')) 
            .on('error', function(err){
                new gutil.PluginError('bower package install error', err, {showStack: true});
            })
        .pipe(notify({ message: "Bower installation was successful", onLast: true }));
});


// Handle FontAwesome
gulp.task('icons', function() { 
    return gulp.src('bower_components/font-awesome/fonts/**.*') 
        .pipe(cache('icons'))
        .pipe(gulp.dest('src/fonts/'))
            .on('error', function(err){
                new gutil.PluginError('copy font-awesome icon error', err, {showStack: true});
            })
        .pipe(notify({ message: "Fonts were copied", onLast: true })); 
});


// Handle all images
gulp.task('pngSprites', function () {
    return sprity.src({
        src: 'src/images/**/*.{png,jpg}',
        style: 'src/scss/sprites.scss',
        processor: 'sass',
    })
        .on('error', function(err){
            new gutil.PluginError('png-sprite error', err, {showStack: true});
        })
    .pipe(cache('pngSprites'))
    .pipe(gulpif('*.png', gulp.dest('.tmp/images/'), gulp.dest('.tmp/scss/')));
});
gulp.task('svgSprites', function() {
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
        .pipe(cache('svgSprites'))
        .pipe(svgSprite(config))
            .on('error', function(err){
                new gutil.PluginError('svg-sprite error', err, {showStack: true});
            })
        .pipe(gulp.dest('.'));
});
gulp.task('copyImgs', function() { 
    return gulp.src('src/images/*.{gif,jpg,png,svg}') 
        .pipe(gulp.dest('.tmp/images/'))
            .on('error', function(err){
                new gutil.PluginError('image copy error', err, {showStack: true});
            }); 
});
gulp.task('imgMin', function() {
    return gulp.src('.tmp/images/*.{gif,jpg,png,svg}')
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            optimizationLevel: 6
        }))
            .on('error', function(err){
                new gutil.PluginError('image minify error', err, {showStack: true});
            })
        .pipe(isProduction ? gulp.dest('dist/images/') : gulp.dest('app/images/'))
        .pipe(notify({ message: "Image tasks were successful", onLast: true }));
});
gulp.task('imageBuild', function() {
    runSequence(['pngSprites', 'svgSprites'], 'copyImgs', 'imgMin')
});


// Handle stylesheets
gulp.task('copySass', function() { 
    return gulp.src('src/scss/**/*.scss') 
        .pipe(cache('copy-sass'))
        .pipe(gulp.dest('.tmp/scss/'))
            .on('error', function(err){
                new gutil.PluginError('scss copy error', err, {showStack: true});
            }); 
});
gulp.task('sassCompile', function() {
    return gulp.src('.tmp/scss/*.scss')
        .pipe(cache('sass'))
        .pipe(sass())
            .on('error', function(err){
                new gutil.PluginError('scss compile error', err, {showStack: true});
            })
        .pipe(gulp.dest('.tmp/scss'));
});
gulp.task('preFix', function () {
    return gulp.src(['.tmp/scss/*.css', '!.tmp/scss/bootstrap.css', '!.tmp/scss/*.min.css'])
        .pipe(cache('prefix'))
        .pipe(autoprefixer({
            browsers: ['> 10%', 'last 2 Chrome versions', 'last 2 Firefox versions', 'last 2 Opera versions', 'last 2 Safari versions', 'not ie <= 10'],
            cascade: false
        }))
            .on('error', function(err){
                new gutil.PluginError('css-prefixing error', err, {showStack: true});
            })
        .pipe(csscomb({
            config: 'csscomb.json'
        }))
        .pipe(isProduction ? base64() : gutil.noop())
            .on('error', function(err){
                new gutil.PluginError('base64 replacement error', err, {showStack: true});
            })
        .pipe(gulp.dest('.tmp/scss'));
});
gulp.task('cssLint', function() {
    return gulp.src(['.tmp/scss/*.css', '!.tmp/scss/*.min.css', '!.tmp/scss/bootstrap.css','!.tmp/scss/fontawesome.css'])
        .pipe(isProduction ? gutil.noop() : csslint())
            .on('error', function(err){
                new gutil.PluginError('css linting error', err, {showStack: true});
            })
        .pipe(csslint.reporter());
});
gulp.task('cssMin', function () {
    return gulp.src(['.tmp/scss/*.css', '!.tmp/scss/*.min.css'])
        .pipe(isProduction ? sourcemaps.init() : gutil.noop())
        .pipe(isProduction ? cssmin() : gutil.noop())
        .pipe(rename({suffix: '.min'}))
        .pipe(isProduction ? sourcemaps.write('.') : gutil.noop())
        .pipe(isProduction ? gulp.dest('dist/styles/') : gulp.dest('app/styles/'))
            .on('error', function(err){
                new gutil.PluginError('css minification error', err, {showStack: true});
            })
        .pipe(notify({ message: "CSS tasks were successful", onLast: true }));
});
gulp.task('styleBuild', function() {
    runSequence('copySass', 'sassCompile', 'preFix', 'cssLint', 'cssMin')
});


// Handle scripts
gulp.task('scriptLint', function() {
    return gulp.src('src/scripts/*.js')
        .pipe(isProduction ? gutil.noop() : jshint())
            .on('error', function(err){
                new gutil.PluginError('script linting error', err, {showStack: true});
            })
        .pipe(jshint.reporter('jshint-stylish'));
});
gulp.task('concatScripts', function() {
    return gulp.src('src/scripts/*.js')
        .pipe(cache('concat-scripts'))
        .pipe(concat('all.js'))
        .pipe(gulp.dest('.tmp/scripts'));
});
gulp.task('scriptMin', function() {
    return gulp.src('.tmp/scripts/all.js')
        .pipe(cache('script-min'))
        .pipe(isProduction ? sourcemaps.init() : gutil.noop())
        .pipe(rename('all.min.js'))
        .pipe(isProduction ? uglify() : gutil.noop())
        .pipe(isProduction ? sourcemaps.write('.') : gutil.noop())
        .pipe(isProduction ? gulp.dest('dist/scripts/') : gulp.dest('app/scripts/'))
            .on('error', function(err){
                new gutil.PluginError('script minification error', err, {showStack: true});
            })
        .pipe(notify({ message: "Script tasks were successful", onLast: true }));
});
gulp.task('scriptBuild', function() {
    runSequence('scriptLint', 'concatScripts', 'scriptMin')
});


// Watch tasks -  livereload + optimize
gulp.task('watch', function(){
    gulp.watch('src/images/**/*.{png,svg,jpg,gif}', ['img-min']).on('change', function(evt) {
        changeEvent(evt);
    });
    gulp.watch('src/scss/*.scss', ['css-min']).on('change', function(evt) {
        changeEvent(evt);
    });
    gulp.watch('src/scripts/*.js', ['script-min']).on('change', function(evt) {
        changeEvent(evt);
    });
});


// Webserver tasks - livereload
gulp.task('webserver', function() {
    return connect.server({
        root: 'app',
        livereload: true
    });
});


gulp.task('build', function() {
    runSequence('cleanUp', ['icons', 'imageBuild', 'scriptBuild'], 'styleBuild');
});
gulp.task('launch', function() {
    runSequence('build', 'webserver', 'watch');
});

