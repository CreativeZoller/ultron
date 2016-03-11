"use strict";
// Variables
var gulp = require('gulp');
var del = require('del');
var sprity = require('sprity');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var plugins = require("gulp-load-plugins")({
    DEBUG: false,
    scope: 'devDependencies',
    camelize: true,
    pattern: ['gulp-*', 'gulp.*'],
    replaceString: /\bgulp[\-.]/
});
var isProduction = false;
if(plugins.util.env.deploy === true) isProduction = true;
var changeEvent = function(evt) {
    plugins.util.log('File', plugins.gutil.colors.cyan(evt.path.replace(new RegExp('/.*(?=/' + basePaths.src + ')/'), '')), 'was', plugins.util.colors.magenta(evt.type));
};
var basePaths = {
    src: 'src/',
    prod: 'app/',
    dev: 'devApp/',
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


// Clean up the mess
gulp.task('cleanUp', function() {
    return del(['devApp/**/*', 'app/**/*', '.tmp/**/*', 'src/fonts/**/*', 'src/**/*.map']);
});

// Init the bower install command
gulp.task('bower', function() { 
    return plugins.bower()
         .pipe(gulp.dest('bower_components/')) 
            .on('error', function(err){
                new plugins.util.PluginError('bower package install error', err, {showStack: true});
            })
        .pipe(plugins.notify({ message: "Bower installation was successful", onLast: true }));
});

// Handle FontAwesome
gulp.task('fonts', function() { 
    return gulp.src('bower_components/font-awesome/fonts/**.*') 
        .pipe(gulp.dest('src/fonts/'))
            .on('error', function(err){
                new plugins.util.PluginError('copy font-awesome icon error', err, {showStack: true});
            })
        .pipe(plugins.notify({ message: "Fonts were copied", onLast: true })); 
});

// For initial testing purposes only
gulp.task('index', function() { 
    return gulp.src('index.html') 
        .pipe(isProduction ? gulp.dest('app/') : gulp.dest('devApp/')); 
});


// Handle all images
gulp.task('pngSprites', function() {
    return sprity.src({
        src: 'src/images/**/*.{png,jpg}',
        style: 'src/scss/sprites.scss',
        processor: 'sass',
    })
        .on('error', function(err){
            new plugins.util.PluginError('png-sprite error', err, {showStack: true});
        })
    .pipe(plugins.if('*.png', gulp.dest('.tmp/images/'), gulp.dest('.tmp/scss/')));
});
gulp.task('retinaSprites', function() {
    var spriteData = gulp.src('src/images/sprites2x/*.png')
        .pipe(plugins.spritesmith({
            retinaSrcFilter: 'src/images/sprites2x/*-2x.png',
            imgName: 'spritesheet.png',
            retinaImgName: 'spritesheet-2x.png',
            cssName: 'sprites-2x.scss'
        }))
            .on('error', function(err){
                new plugins.util.PluginError('retina sprite error', err, {showStack: true});
            });
    spriteData.img.pipe(gulp.dest('.tmp/images/'));
    spriteData.css.pipe(gulp.dest('.tmp/scss/'));
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
        .pipe(plugins.svgSprite(config))
            .on('error', function(err){
                new plugins.util.PluginError('svg-sprite error', err, {showStack: true});
            })
        .pipe(gulp.dest('.'));
});
gulp.task('copyImgs', function() { 
    return gulp.src('src/images/*.{gif,jpg,png,svg}') 
        .pipe(gulp.dest('.tmp/images/'))
            .on('error', function(err){
                new plugins.util.PluginError('image copy error', err, {showStack: true});
            }); 
});
gulp.task('imgMin', function() {
    return gulp.src('.tmp/images/*.{gif,jpg,png,svg}')
        .pipe(isProduction ? plugins.imagemin({
            progressive: true,
            interlaced: true,
            optimizationLevel: 6
        }) : plugins.util.noop())
            .on('error', function(err){
                new plugins.util.PluginError('image minify error', err, {showStack: true});
            })
        .pipe(isProduction ? gulp.dest('app/images/') : gulp.dest('devApp/images/'))
        .pipe(plugins.notify({ message: "Image tasks were successful", onLast: true }));
});
gulp.task('imageBuild', function() {
    runSequence(['pngSprites', 'retinaSprites', 'svgSprites'], 'copyImgs', 'imgMin', function() {
        reload({ stream: true })
    })
});


// Handle stylesheets
gulp.task('copySass', function() { 
    return gulp.src('src/scss/**/*.scss') 
        .pipe(gulp.dest('.tmp/scss'))
            .on('error', function(err){
                new plugins.util.PluginError('scss copy error', err, {showStack: true});
            }); 
});
gulp.task('sassCompile', function() {
    return gulp.src('.tmp/scss/*.scss')
        .pipe(plugins.sass())
            .on('error', function(err){
                new plugins.util.PluginError('scss compile error', err, {showStack: true});
            })
        .pipe(gulp.dest('.tmp/scss'));
});
gulp.task('preFix', function () {
    return gulp.src(['.tmp/scss/*.css', '!.tmp/scss/bootstrap.css', '!.tmp/scss/*.min.css'])
        .pipe(plugins.autoprefixer({
            browsers: ['> 10%', 'last 2 Chrome versions', 'last 2 Firefox versions', 'last 2 Opera versions', 'last 2 Safari versions', 'not ie <= 10'],
            cascade: false
        }))
            .on('error', function(err){
                new plugins.util.PluginError('css-prefixing error', err, {showStack: true});
            })
        .pipe(plugins.csscomb({
            config: 'csscomb.json'
        }))
        .pipe(isProduction ? plugins.base64() : plugins.util.noop())
            .on('error', function(err){
                new plugins.util.PluginError('base64 replacement error', err, {showStack: true});
            })
        .pipe(gulp.dest('.tmp/scss'));
});
gulp.task('cssLint', function() {
    return gulp.src(['.tmp/scss/*.css', '!.tmp/scss/*.min.css', '!.tmp/scss/bootstrap.css','!.tmp/scss/fontawesome.css'])
        .pipe(isProduction ? plugins.util.noop() : plugins.csslint())
            .on('error', function(err){
                new plugins.util.PluginError('css linting error', err, {showStack: true});
            })
        .pipe(plugins.csslint.reporter());
});
gulp.task('cssMin', function () {
    return gulp.src(['.tmp/scss/*.css', '!.tmp/scss/*.min.css'])
        .pipe(isProduction ? plugins.sourcemaps.init() : plugins.util.noop())
        .pipe(isProduction ? plugins.cssmin() : plugins.util.noop())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(isProduction ? plugins.sourcemaps.write('.') : plugins.util.noop())
        .pipe(isProduction ? gulp.dest('app/styles/') : gulp.dest('devApp/styles/'))
            .on('error', function(err){
                new plugins.util.PluginError('css minification error', err, {showStack: true});
            })
        .pipe(plugins.notify({ message: "CSS tasks were successful", onLast: true }));
});
gulp.task('styleBuild', function() {
    runSequence('copySass', 'sassCompile', 'preFix', 'cssLint', 'cssMin', function() {
        reload({ stream: true })
    })
});


// Handle scripts
gulp.task('scriptLint', function() {
    return gulp.src('src/scripts/*.js')
        .pipe(isProduction ? plugins.util.noop() : plugins.jshint())
            .on('error', function(err){
                new plugins.util.PluginError('script linting error', err, {showStack: true});
            })
        .pipe(plugins.jshint.reporter('jshint-stylish'));
});
gulp.task('concatScripts', function() {
    return gulp.src('src/scripts/*.js')
        .pipe(plugins.concat('all.js'))
        .pipe(gulp.dest('.tmp/scripts'));
});
gulp.task('scriptMin', function() {
    return gulp.src('.tmp/scripts/all.js')
        .pipe(isProduction ? plugins.sourcemaps.init() : plugins.util.noop())
        .pipe(plugins.rename('all.min.js'))
        .pipe(isProduction ? plugins.uglify() : plugins.util.noop())
        .pipe(isProduction ? plugins.sourcemaps.write('.') : plugins.util.noop())
        .pipe(isProduction ? gulp.dest('app/scripts/') : gulp.dest('devApp/scripts/'))
            .on('error', function(err){
                new plugins.util.PluginError('script minification error', err, {showStack: true});
            })
        .pipe(plugins.notify({ message: "Script tasks were successful", onLast: true }));
});
gulp.task('scriptBuild', function() {
    runSequence('scriptLint', 'concatScripts', 'scriptMin', function() {
        reload({ stream: true })
    })
});


// Webserver tasks
gulp.task('build', function() {
    runSequence('cleanUp', 'index', 'fonts', 'imageBuild', 'styleBuild', 'scriptBuild')
});
gulp.task('serve', function() {
    browserSync({
        server: {
        baseDir: 'devApp'
        }
    });
    gulp.watch('src/scss/**/*.scss', ['styleBuild']).on('change', function(evt) {
        changeEvent(evt);
    });
    gulp.watch('src/scripts/**/*.js', ['scriptBuild']).on('change', function(evt) {
        changeEvent(evt);
    });
    gulp.watch('src/images/**/*.{png,svg,jpg,gif}', ['imageBuild']).on('change', function(evt) {
        changeEvent(evt);
    });
});

