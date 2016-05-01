"use strict";
var gulp = require('gulp');
var plugins = require("gulp-load-plugins")({
    DEBUG: false,
    scope: 'devDependencies',
    camelize: true,
    pattern: ['gulp-*', 'gulp.*'],
    replaceString: /\bgulp[\-.]/
});
var del = require('del');
var sprity = require('sprity');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
//var config = require('./secretConf.json');
// using external config data like: config.desktop
var isProduction = false;
if(plugins.util.env.deploy === true) isProduction = true;
var changeEvent = function(evt) {
    plugins.util.log('File', plugins.gutil.colors.cyan(evt.path.replace(new RegExp('/.*(?=/' + basePaths.src + ')/'), '')), 'was', plugins.util.colors.magenta(evt.type));
};
var bundleTimer = plugins.duration('bundle time');
var basePaths = {
    root: './',
    src: 'src/',
    prod: 'app/',
    dev: 'devApp/',
    temp: '.tmp/',
    bower: 'bower_components/',
    test: 'src/tests/',
    devFiles: 'devApp/**/*',
    prodFiles: 'app/**/*',
    tempFiles: '.tmp/**/*',
    srcFonts: 'src/scss/fonts/*',
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
      .on('error', function(err) {
          plugins.notify.onError({ title: 'bowerInstall error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      })
    .pipe(plugins.bower({ cmd: 'prune'}))
      .on('error', function(err) {
          plugins.notify.onError({ title: 'bowerPrune error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      });
});

// Handle FontAwesome
gulp.task('fonts', function() { 
  return gulp.src(paths.fonts.src) 
    .pipe(gulp.dest(paths.fonts.prod))
      .on('error', function(err) {
          plugins.notify.onError({ title: 'fontAwesome error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      });
});

// For initial testing purposes only
gulp.task('index', function() { 
  return gulp.src('index.html') 
    .pipe(isProduction ? gulp.dest(basePaths.prod) : gulp.dest(basePaths.dev)); 
});

// Handle all html files
gulp.task('checkHtml', function() {
  return gulp.src([basePaths.prod + '**/*.html', basePaths.dev + '**/*.html', basePaths.root + '/*.html'])
    .pipe(isProduction ? plugins.util.noop() : plugins.htmlhint('.htmlhintrc'))
      .on('error', function(err) {
          plugins.notify.onError({ title: 'htmlLinting error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      })
    .pipe(plugins.htmlhint.reporter("htmlhint-stylish")) ;
});
gulp.task('replaceHtml', function () {
  return gulp.src([basePaths.root + '*.html', basePaths.prod + '*.html', basePaths.dev + '*.html'])
    .pipe(isProduction ?
      plugins.inject(gulp.src([paths.scripts.prod + '*.js', paths.styles.prod + '*.css'], {read: true}), {relative: true}) :
      plugins.inject(gulp.src([paths.scripts.dev + '*.js', paths.styles.dev + '*.css'], {read: true}), {relative: true}))
        .on('error', function(err) {
            plugins.notify.onError({ title: 'htmlInjection error!', message: '<%= error.message %>', sound: 'Frog' })(err);
            this.emit('end');
        })
    .pipe(isProduction ? gulp.dest(basePaths.prod) : gulp.dest(basePaths.dev));
});
gulp.task('minifyHtml', function() {
  return gulp.src(isProduction ? basePaths.prod + '*.html' : basePaths.dev + '*.html')
    .pipe(isProduction ? minifyHtml({
      removeComments: true,
			removeCommentsFromCDATA: true,
			removeCDATASectionsFromCDATA: true,
			collapseWhitespace: true,
			collapseInlineTagWhitespace: true,
			conservativeCollapse: true,
			preserveLineBreaks: true,
			removeScriptTypeAttributes: true
		}) : plugins.util.noop())
    .on('error', function(err) {
        plugins.notify.onError({ title: 'htmlMinify error!', message: '<%= error.message %>', sound: 'Frog' })(err);
        this.emit('end');
    })
		.pipe(isProduction ? gulp.dest(basePaths.prod) : gulp.dest(basePaths.dev));
});
gulp.task('htmlBuild', function() {
  runSequence(['index'], 'checkHtml', 'replaceHtml', 'minifyHtml', function() {
    reload({ stream: true })
  })
});


// Handle all images
gulp.task('pngSprites', function() {
  return sprity.src({
    src: paths.images.src + '*.{png,jpg}',
    style: paths.styles.src + 'sprites.scss',
    processor: 'sass',
    prefix: 'ult',
    template: 'custom.hbs'
  })
    .on('error', function(err) {
        plugins.notify.onError({ title: 'pngSprite error!', message: '<%= error.message %>', sound: 'Frog' })(err);
        this.emit('end');
    })
  .pipe(plugins.if('*.png', gulp.dest(paths.images.temp), gulp.dest(paths.styles.temp)));
});
gulp.task('retinaSprites', function() {
  var spriteData = gulp.src(paths.images.src + 'sprites2x/*.png')
    .pipe(plugins.spritesmith({
      algorithm: 'binary-tree',
      retinaSrcFilter: paths.images.src + 'sprites2x/*-2x.png',
      imgName: 'spritesheet.png',
      retinaImgName: 'spritesheet-2x.png',
      cssName: 'retinaSprites.scss'
    }))
      .on('error', function(err) {
          plugins.notify.onError({ title: 'retinaSprites error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      })
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
        }
      }
    }
  };
  return gulp.src(paths.images.src + '**/*.svg')
    .pipe(plugins.svgSprite(config))
      .on('error', function(err) {
          plugins.notify.onError({ title: 'svgSprite error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      })
    .pipe(gulp.dest('.'));
});
gulp.task('copyImgs', function() { 
  return gulp.src(paths.images.src + '*.{gif,jpg,png,svg}') 
    .pipe(gulp.dest(paths.images.temp))
      .on('error', function(err) {
          plugins.notify.onError({ title: 'copyImgs error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      }); 
});
gulp.task('imgMin', function() {
  return gulp.src(paths.images.temp + '*.{gif,jpg,png,svg}')
    .pipe(isProduction ? plugins.imagemin({
      progressive: true,
      interlaced: true,
      optimizationLevel: 7,
      use: [pngQuant()]
    }) : plugins.util.noop())
      .on('error', function(err) {
          plugins.notify.onError({ title: 'imgMin error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      })
    .pipe(isProduction ? gulp.dest(paths.images.prod) : gulp.dest(paths.images.dev));
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
      .on('error', function(err) {
          plugins.notify.onError({ title: 'copySass error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      });
});
gulp.task('replaceSassPx', function() {
	return gulp.src(paths.styles.temp + '**/*.scss')
		.pipe(plugins.replaceTask({
			patterns: [{
				match: /0px/g,
				replacement: '0'
			}]
		}))
      .on('error', function(err) {
        plugins.notify.onError({ title: 'replaceSassPx error!', message: '<%= error.message %>', sound: 'Frog' })(err);
        this.emit('end');
      })
		.pipe(gulp.dest(paths.styles.temp));
});
gulp.task('lintSass', function() {
	return gulp.src([paths.styles.temp + '**/*.scss', '!' + paths.styles.temp + 'includes/*.scss', '!' + paths.styles.temp + 'bootstrap.scss', '!' + paths.styles.temp + 'fontawesome.scss', '!' + paths.styles.temp + 'sprites.scss', '!' + paths.styles.temp + 'retinaSprites.scss', '!' + paths.styles.temp + 'svg_sprites.scss'])
    .on('error', function(err) {
        plugins.notify.onError({ title: 'lintSass error!', message: '<%= error.message %>', sound: 'Frog' })(err);
        this.emit('end');
    })
		.pipe(plugins.scssLint({'config': 'lint.yml'}));
});
gulp.task('sassCompile', function() {
  return gulp.src([paths.styles.temp + '*.scss', '!' + paths.styles.temp + 'sprites.scss', '!' + paths.styles.temp + 'retinaSprites.scss'])
    .pipe(plugins.sass())
      .on('error', function(err) {
          plugins.notify.onError({ title: 'sassCompile error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      })
    .pipe(gulp.dest(paths.styles.temp));
});
gulp.task('retinaSpriteUrl', function() {
  return gulp.src(paths.styles.temp + 'retinaSprites.css')
    .pipe(plugins.replaceTask({
			patterns: [{
				match: /sprite/g,
				replacement: '../images/sprite'
			}]
		}))
    .on('error', function(err) {
        plugins.notify.onError({ title: 'retinaSpriteUrl error!', message: '<%= error.message %>', sound: 'Frog' })(err);
        this.emit('end');
    })
		.pipe(gulp.dest(paths.styles.temp));
});
gulp.task('svgSpriteUrl', function() {
  return gulp.src(paths.styles.temp + 'svg_sprites.scss')
    .pipe(plugins.replaceTask({
			patterns: [{
				match: /.tmp/g,
				replacement: '..'
			}]
		}))
    .on('error', function(err) {
        plugins.notify.onError({ title: 'svgSpriteUrl error!', message: '<%= error.message %>', sound: 'Frog' })(err);
        this.emit('end');
    })
		.pipe(gulp.dest(paths.styles.temp));
});
gulp.task('preFix', function () {
  return gulp.src([paths.styles.temp + '*.css', '!' + paths.styles.temp + 'bootstrap.css', '!' + paths.styles.temp + '*.min.css'])
    .pipe(plugins.autoprefixer({
      browsers: ['> 10%', 'last 2 Chrome versions', 'last 2 Firefox versions', 'last 2 Opera versions', 'last 2 Safari versions', 'not ie <= 10'],
      cascade: false
    }))
      .on('error', function(err) {
          plugins.notify.onError({ title: 'preFix error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      })
    .pipe(plugins.csscomb({
      config: 'csscomb.json'
    }))
    .pipe(isProduction ? plugins.base64() : plugins.util.noop())
      .on('error', function(err) {
          plugins.notify.onError({ title: 'base64 error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      })
    .pipe(gulp.dest(paths.styles.temp));
});
gulp.task('cssLint', function() {
  return gulp.src([paths.styles.temp + '*.css', '!' + paths.styles.temp + '*.min.css', '!' + paths.styles.temp + 'bootstrap.css','!' + paths.styles.temp + 'fontawesome.css'])
    .pipe(isProduction ? plugins.util.noop() : plugins.csslint('csslintrc.json'))
      .on('error', function(err) {
          plugins.notify.onError({ title: 'cssLint error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      })
    .pipe(isProduction ? plugins.csslint.reporter('junit-xml') : plugins.csslint.reporter('compact'));
});
gulp.task('cssMin', function () {
  return gulp.src([paths.styles.temp + '*.css', '!' + paths.styles.temp + '*.min.css'])
    .pipe(isProduction ? plugins.sourcemaps.init() : plugins.util.noop())
    .pipe(isProduction ? plugins.cssmin({keepSpecialComments:0}) : plugins.util.noop())
    //.pipe(plugins.rename({suffix: '.min'}))
    .pipe(isProduction ? plugins.sourcemaps.write('.') : plugins.util.noop())
    .pipe(isProduction ? gulp.dest(paths.styles.prod) : gulp.dest(paths.styles.dev))
      .on('error', function(err) {
          plugins.notify.onError({ title: 'cssMin error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      });
});
gulp.task('styleBuild', function() {
  runSequence('copySass', 'replaceSassPx', 'lintSass', 'sassCompile', 'retinaSpriteUrl', 'svgSpriteUrl', 'preFix', 'cssLint', 'cssMin', function() {
    reload({ stream: true })
  })
});


// Handle scripts
gulp.task('scriptLint', function() {
  return gulp.src(paths.scripts.src + '*.js')
    .pipe(isProduction ? plugins.util.noop() : plugins.jshint('.jshintrc'))
      .on('error', function(err) {
          plugins.notify.onError({ title: 'scriptLint error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      })
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});
gulp.task('scriptFix', function() {
  return gulp.src(paths.scripts.src + '*.js')
    .pipe(isProduction ? plugins.util.noop() : plugins.fixmyjs())
      .on('error', function(err) {
          plugins.notify.onError({ title: 'scriptFix error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      })
    .pipe(gulp.dest(paths.scripts.src));
});
gulp.task('scriptModernizr', function() {
  return gulp.src(paths.scripts.src + '*.js')
    .pipe(plugins.modernizr())
      .on('error', function(err) {
          plugins.notify.onError({ title: 'scriptModernizr error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      })
    .pipe(isProduction ? gulp.dest(paths.scripts.prod) : gulp.dest(paths.scripts.dev))
});
gulp.task('concatScripts', function() {
  return gulp.src(paths.scripts.src + '*.js')
    .pipe(plugins.concat('main.js'))
      .on('error', function(err) {
          plugins.notify.onError({ title: 'concatScripts error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      })
    .pipe(gulp.dest(paths.scripts.temp));
});
gulp.task('scriptMin', function() {
  return gulp.src(paths.scripts.temp + 'main.js')
    .pipe(isProduction ? plugins.sourcemaps.init() : plugins.util.noop())
    .pipe(plugins.rename('main.min.js'))
    .pipe(isProduction ? plugins.uglify() : plugins.util.noop())
    .pipe(isProduction ? plugins.sourcemaps.write('.') : plugins.util.noop())
    .pipe(isProduction ? gulp.dest(paths.scripts.prod) : gulp.dest(paths.scripts.dev))
      .on('error', function(err) {
          plugins.notify.onError({ title: 'scriptMin error!', message: '<%= error.message %>', sound: 'Frog' })(err);
          this.emit('end');
      });
});
gulp.task('scriptBuild', function() {
    runSequence('scriptLint', 'scriptFix', 'scriptModernizr', 'concatScripts', 'scriptMin', function() {
        reload({ stream: true })
    })
});


// Webserver tasks
gulp.task('build', function() {
    runSequence(['cleanUp'], 'htmlBuild', 'imageBuild', 'styleBuild', 'scriptBuild');
});
// watch tasks must be updated after gulp 4.0
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
        reloadOnRestart: true,
        server: {
            baseDir: paths.scripts.dev
        }
    });
});
