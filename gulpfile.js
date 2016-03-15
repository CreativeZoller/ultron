"use strict";
// Variables
var gulp = require('gulp');
var del = require('del');
var sprity = require('sprity');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var ngrok = require('ngrok');
var psi = require('psi');
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
    root: '.',
    src: 'src/',
    prod: 'app/',
    dev: 'devApp/',
    temp: '.tmp/',
    bower: 'bower_components/',
    test: 'src/tests/',
    devFiles: 'devApp/**/*',
    prodFiles: 'app/**/*',
    tempFiles: '.tmp/**/*',
    srcFonts: 'src/fonts/**/*',
    srcMaps: 'src/**/*.map'
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
    del([basePaths.devFiles, basePaths.prodFiles, basePaths.tempFiles, basePaths.srcFonts, basePaths.srcMaps]);
});

// Init the bower install command
gulp.task('bower', function() { 
    return plugins.bower()
         .pipe(gulp.dest(basePaths.bower)) 
            .on('error', function(err){
                new plugins.util.PluginError('bower package install error', err, {showStack: true});
            })
        .pipe(plugins.notify({ message: "Bower installation was successful", onLast: true }));
});

// Handle FontAwesome
gulp.task('fonts', function() { 
    return gulp.src(paths.fonts.src) 
        .pipe(gulp.dest(paths.fonts.prod))
            .on('error', function(err){
                new plugins.util.PluginError('copy font-awesome icon error', err, {showStack: true});
            })
        .pipe(plugins.notify({ message: "Fonts were copied", onLast: true })); 
});

// For initial testing purposes only
gulp.task('index', function() { 
    return gulp.src('index.html') 
        .pipe(isProduction ? gulp.dest(basePaths.prod) : gulp.dest(basePaths.dev)); 
});

// Check the compiled html files
gulp.task('checkHtml', function() {
    return gulp.src([basePaths.prod + '**/*.html', basePaths.dev + '**/*.html', basePaths.root + '/*.html'])
        .pipe(isProduction ? plugins.util.noop() : plugins.htmlhint('.htmlhintrc'))
        .pipe(plugins.htmlhint.reporter("htmlhint-stylish")) ;
});


// Handle all images
gulp.task('pngSprites', function() {
    return sprity.src({
        src: paths.images.src + '**/*.{png,jpg}',
        style: paths.styles.src + 'sprites.scss',
        processor: 'sass',
    })
        .on('error', function(err){
            new plugins.util.PluginError('png-sprite error', err, {showStack: true});
        })
    .pipe(plugins.if('*.png', gulp.dest(paths.images.temp), gulp.dest(paths.styles.temp)));
});
gulp.task('retinaSprites', function() {
    var spriteData = gulp.src(paths.images.src + 'sprites2x/*.png')
        .pipe(plugins.spritesmith({
            retinaSrcFilter: paths.images.src + 'sprites2x/*-2x.png',
            imgName: 'spritesheet.png',
            retinaImgName: 'spritesheet-2x.png',
            cssName: 'sprites-2x.scss'
        }))
            .on('error', function(err){
                new plugins.util.PluginError('retina sprite error', err, {showStack: true});
            });
    spriteData.img.pipe(gulp.dest(paths.images.temp));
    spriteData.css.pipe(gulp.dest(paths.styles.temp));
});
gulp.task('svgSprites', function() {
    var config = {
        dest : basePaths.root,
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
                dest : basePaths.root,
                sprite : paths.images.temp + 'sprites.svg',
                render : {
                    scss : {
                        dest : paths.styles.temp + 'svg_sprites.scss'
                    }
                },
            }
        }
    };
    return gulp.src(paths.images.src + '**/*.svg')
        .pipe(plugins.svgSprite(config))
            .on('error', function(err){
                new plugins.util.PluginError('svg-sprite error', err, {showStack: true});
            })
        .pipe(gulp.dest('.'));
});
gulp.task('copyImgs', function() { 
    return gulp.src(paths.images.src + '*.{gif,jpg,png,svg}') 
        .pipe(gulp.dest(paths.images.temp))
            .on('error', function(err){
                new plugins.util.PluginError('image copy error', err, {showStack: true});
            }); 
});
gulp.task('imgMin', function() {
    return gulp.src(paths.images.temp + '*.{gif,jpg,png,svg}')
        .pipe(isProduction ? plugins.imagemin({
            progressive: true,
            interlaced: true,
            optimizationLevel: 6
        }) : plugins.util.noop())
            .on('error', function(err){
                new plugins.util.PluginError('image minify error', err, {showStack: true});
            })
        .pipe(isProduction ? gulp.dest(paths.images.prod) : gulp.dest(paths.images.dev))
        .pipe(plugins.notify({ message: "Image tasks were successful", onLast: true }));
});
gulp.task('imageBuild', function() {
    runSequence(['pngSprites', 'retinaSprites', 'svgSprites'], 'copyImgs', 'imgMin', function() {
        reload({ stream: true })
    })
});


// Handle stylesheets
gulp.task('copySass', function() { 
    return gulp.src(paths.styles.src + '**/*.scss') 
        .pipe(gulp.dest(paths.styles.temp))
            .on('error', function(err){
                new plugins.util.PluginError('scss copy error', err, {showStack: true});
            }); 
});
gulp.task('sassCompile', function() {
    return gulp.src(paths.styles.temp + '*.scss')
        .pipe(plugins.sass())
            .on('error', function(err){
                new plugins.util.PluginError('scss compile error', err, {showStack: true});
            })
        .pipe(gulp.dest(paths.styles.temp));
});
gulp.task('preFix', function () {
    return gulp.src([paths.styles.temp + '*.css', '!' + paths.styles.temp + 'bootstrap.css', '!' + paths.styles.temp + '*.min.css'])
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
        .pipe(gulp.dest(paths.styles.temp));
});
gulp.task('cssLint', function() {
    return gulp.src([paths.styles.temp + '*.css', '!' + paths.styles.temp + '*.min.css', '!' + paths.styles.temp + 'bootstrap.css','!' + paths.styles.temp + 'fontawesome.css'])
        .pipe(isProduction ? plugins.util.noop() : plugins.csslint())
            .on('error', function(err){
                new plugins.util.PluginError('css linting error', err, {showStack: true});
            })
        .pipe(plugins.csslint.reporter());
});
gulp.task('cssMin', function () {
    return gulp.src([paths.styles.temp + '*.css', '!' + paths.styles.temp + '*.min.css'])
        .pipe(isProduction ? plugins.sourcemaps.init() : plugins.util.noop())
        .pipe(isProduction ? plugins.cssmin() : plugins.util.noop())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(isProduction ? plugins.sourcemaps.write('.') : plugins.util.noop())
        .pipe(isProduction ? gulp.dest(paths.styles.prod) : gulp.dest(paths.styles.dev))
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
    return gulp.src(paths.scripts.src + '*.js')
        .pipe(isProduction ? plugins.util.noop() : plugins.jshint('.jshintrc'))
            .on('error', function(err){
                new plugins.util.PluginError('script linting error', err, {showStack: true});
            })
        .pipe(plugins.jshint.reporter('jshint-stylish'));
});
gulp.task('scriptFix', function() {
    return gulp.src(paths.scripts.src + '*.js')
        .pipe(isProduction ? plugins.util.noop() : plugins.fixmyjs())
        .pipe(gulp.dest(paths.scripts.src));
});
gulp.task('concatScripts', function() {
    return gulp.src(paths.scripts.src + '*.js')
        .pipe(plugins.concat('all.js'))
        .pipe(gulp.dest(paths.scripts.temp));
});
gulp.task('scriptMin', function() {
    return gulp.src(paths.scripts.temp + 'all.js')
        .pipe(isProduction ? plugins.sourcemaps.init() : plugins.util.noop())
        .pipe(plugins.rename('all.min.js'))
        .pipe(isProduction ? plugins.uglify() : plugins.util.noop())
        .pipe(isProduction ? plugins.sourcemaps.write('.') : plugins.util.noop())
        .pipe(isProduction ? gulp.dest(paths.scripts.prod) : gulp.dest(paths.scripts.dev))
            .on('error', function(err){
                new plugins.util.PluginError('script minification error', err, {showStack: true});
            })
        .pipe(plugins.notify({ message: "Script tasks were successful", onLast: true }));
});
gulp.task('scriptBuild', function() {
    runSequence('scriptLint', 'scriptFix', 'concatScripts', 'scriptMin', function() {
        reload({ stream: true })
    })
});


// ES6



// Webserver tasks
gulp.task('build', function() {
    runSequence('cleanUp', 'index', 'fonts', 'imageBuild', 'styleBuild', 'scriptBuild')
});
gulp.task('nightWatch', ['serve'], function() {
    gulp.watch(paths.styles.src + '**/*.scss', ['styleBuild']).on('change', function(evt) {
        changeEvent(evt);
    });
    gulp.watch(paths.scripts.src + '**/*.js', ['scriptBuild']).on('change', function(evt) {
        changeEvent(evt);
    });
    gulp.watch(paths.images.src + '**/*.{png,svg,jpg,gif}', ['imageBuild']).on('change', function(evt) {
        changeEvent(evt);
    });
});
gulp.task('serve', function() {
    browserSync({
        open: true,
        server: {
            baseDir: paths.scripts.dev
        }
    });
});

