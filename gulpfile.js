// *************************************
//
//   Gulpfile
//
// *************************************
//
// Available tasks w/ gulp naming tag
//  ...
// *************************************
'use strict';
var gulp    = require('gulp'),
    plugins = require('gulp-load-plugins')({
        DEBUG: false,
        scope: 'devDependencies',
        camelize: true,
        pattern: ['gulp-*', 'gulp.*'],
        replaceString: /\bgulp[\-.]/
    }),
    taskPath = './gulptasks/',
    gConfig = require('./gulptasks/gulp-config'),
    taskList = require('fs').readdirSync(taskPath);



// -------------------------------------
//   Modules > taskfiles
// -------------------------------------
//
//  gulp              : The streaming build system
//  ...
//
// -------------------------------------
var del = require('del');
var fs = require('fs');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var isProduction = false;
if(plugins.util.env.deploy === true) isProduction = true;
var changeEvent = function(evt) {
    plugins.util.log('File', evt.path.replace(new RegExp('/.*(?=/' + gConfig.src.basePaths.src + ')/'), ''), 'was', evt.type);
};

// -------------------------------------
//   Task: Clear: Everything
// -------------------------------------
gulp.task('clear:all', function () {
  return del(gConfig.src.srcCleanUp());
});



// -------------------------------------
//   Task: Generate: TODO file
// -------------------------------------
gulp.task('gen:todo', function() {
  return gulp.src(gConfig.src.srcTodo())
    .pipe(plugins.todo())
    .pipe(gulp.dest(gConfig.src.destTodo))
    .pipe(plugins.todo.reporter('json', {fileName: 'todo.json'}))
    .pipe(gulp.dest(gConfig.src.destTodo))
});
// -------------------------------------
//   Task: Copy: FontAwesome icons
// -------------------------------------
gulp.task('copy:fonts', function() { 
  return gulp.src(gConfig.src.paths.fonts.src) 
    .pipe(gulp.dest(gConfig.src.paths.fonts.temp));
});
gulp.task('copy:fontsFinal', function() { 
  return gulp.src(gConfig.src.paths.fonts.tmp2) 
    .pipe(gulp.dest(gConfig.src.paths.fonts.prod));
});
// -------------------------------------
//   Task: Copy: Test html file
// -------------------------------------
gulp.task('copy:index', function() { 
  return gulp.src(gConfig.src.basePaths.srcView) 
  .pipe(gulp.dest(gConfig.src.basePaths.prod)); 
});
// -------------------------------------
//   Task: Lint: Html files
// -------------------------------------
gulp.task('lint:html', function() {
  return gulp.src([gConfig.src.basePaths.prod + '**/*.html', gConfig.src.basePaths.root + '/*.html'])
    .pipe(isProduction ? plugins.util.noop() : plugins.htmlhint('.htmlhintrc'))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
    .pipe(plugins.htmlhint.reporter("htmlhint-stylish")) ;
});
// -------------------------------------
//   Task: Inject: to Html files
// -------------------------------------
gulp.task('inject:html', function() {
  return gulp.src([gConfig.src.basePaths.root + '*.html', gConfig.src.basePaths.prod + '*.html'])
    .pipe(plugins.inject(gulp.src([gConfig.src.paths.scripts.prod + '*.js', gConfig.src.paths.styles.prod + '*.css'], {read: true}), {relative: true}))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
    .pipe(gulp.dest(gConfig.src.basePaths.prod));
});
// -------------------------------------
//   Task: Minify: Html files
// -------------------------------------
gulp.task('minify:html', function() {
  return gulp.src(gConfig.src.basePaths.prod + '*.html')
    .pipe(isProduction ? plugins.htmlmin(gConfig.options.htmlMin) : plugins.util.noop())
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
		.pipe(gulp.dest(gConfig.src.basePaths.prod));
});
// -------------------------------------
//   MultiTask: Html tasklist
// -------------------------------------
gulp.task('htmlBuild', function(done) {
  runSequence('lint:html', 'inject:html', 'minify:html', function() {
    done();
  });
});



// -------------------------------------
//   Task: Lint: JavaScript files
// -------------------------------------
gulp.task('lint:js', function() {
  return gulp.src(gConfig.src.srcJSLint)
    .pipe(plugins.changed(gConfig.src.paths.scripts.src))
    .pipe(isProduction ? plugins.util.noop() : plugins.jshint('.jshintrc'))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});
// -------------------------------------
//   Task: Fix: JavaScript files
// -------------------------------------
gulp.task('fix:js', function() {
  return gulp.src(gConfig.src.srcJSLint)
    .pipe(plugins.changed(gConfig.src.paths.scripts.src))
    .pipe(isProduction ? plugins.util.noop() : plugins.fixmyjs())
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
    .pipe(gulp.dest(gConfig.src.paths.scripts.src));
});
// -------------------------------------
//   Task: Generate: Modernizr Scripts
// -------------------------------------
gulp.task('gen:modernizr', function() {
  return gulp.src(gConfig.src.srcJSLint)
    .pipe(plugins.modernizr(gConfig.options.modernizr))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
    .pipe(gulp.dest(gConfig.src.paths.scripts.prod))
});
// -------------------------------------
//   Task: Concatenate: JavaScript files
// -------------------------------------
gulp.task('concat:js', function() {
  return gulp.src(gConfig.src.srcJSLint)
    .pipe(plugins.concat(gConfig.src.ccJSName))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
    .pipe(gulp.dest(gConfig.src.paths.scripts.temp));
});
// -------------------------------------
//   Task: Minify: JavaScript files
// -------------------------------------
gulp.task('minify:js', function() {
  return gulp.src(gConfig.src.paths.scripts.temp + gConfig.src.ccJSName)
    .pipe(isProduction ? plugins.sourcemaps.init() : plugins.util.noop())
    .pipe(plugins.rename('main.min.js'))
    .pipe(isProduction ? plugins.uglify() : plugins.util.noop())
    .pipe(isProduction ? plugins.sourcemaps.write('.') : plugins.util.noop())
    .pipe(gulp.dest(gConfig.src.paths.scripts.prod))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      });
});
// -------------------------------------
//   MultiTask: Script tasklist
// -------------------------------------
gulp.task('scriptBuild', function(done) {
  runSequence('lint:js', 'fix:js', 'gen:modernizr', 'concat:js', 'minify:js', function() {
    done();
  });
});


// -------------------------------------
//   Task: Spritesheet: Png, Jpg files
// -------------------------------------
gulp.task('sprites:png', function() {
    var spritePngs = gulp.src(gConfig.src.paths.images.src + '*.{png,jpg}')
      .pipe(plugins.spritesmith({
        algorithm: 'binary-tree',
        cssFormat: 'sass',
        imgName: 'sprites.png',
        cssName: 'sprites.scss',
      }))
        .on('error', function(err) {
          plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
          this.emit('end');
        })
    spritePngs.img.pipe(gulp.dest(gConfig.src.paths.images.temp));
    spritePngs.css.pipe(gulp.dest(gConfig.src.paths.styles.temp));
});

// -------------------------------------
//   Task: Spritesheet: Retina files
// -------------------------------------
gulp.task('sprites:retina', function() {
  var spriteData = gulp.src(gConfig.src.srcRetineSprites)
    .pipe(plugins.spritesmith({
      algorithm: 'binary-tree',
      retinaSrcFilter: gConfig.src.srcBRetinaSprites,
      imgName: gConfig.src.nameRetinaImg,
      retinaImgName: gConfig.src.nameBRetinaImg,
      cssName: gConfig.src.nameRetinaCss
    }))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
  spriteData.img.pipe(gulp.dest(gConfig.src.destRetinaImg));
  spriteData.css.pipe(gulp.dest(gConfig.src.destRetinaCss));
});
// -------------------------------------
//   Task: Spritesheet: SVG files
// -------------------------------------
gulp.task('sprites:svg', function() {
  return gulp.src(gConfig.src.srcSvgSprites)
    .pipe(plugins.svgSprite(gConfig.options.svgSprite))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
    .pipe(gulp.dest(gConfig.src.destSvgSprites));
});
// -------------------------------------
//   Task: Copy: Image files
// -------------------------------------
gulp.task('copy:images', function() { 
  return gulp.src(gConfig.src.srcImages) 
    .pipe(gulp.dest(gConfig.src.destImages))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      });
});
// -------------------------------------
//   Task: Minify: Image files
// -------------------------------------
gulp.task('minify:images', function() {
  return gulp.src(gConfig.src.srcMinifyImf)
    .pipe(isProduction ? plugins.imagemin(gConfig.options.imageMin) : plugins.util.noop())
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
    .pipe(gulp.dest(gConfig.src.paths.images.prod));
});
// -------------------------------------
//   MultiTask: Image tasklist
// -------------------------------------
gulp.task('imageBuild', function(done) {
  runSequence(['sprites:png', 'sprites:retina', 'sprites:svg'], 'copy:images', 'minify:images', function() {
    done();
  });
});


// -------------------------------------
//   Task: Copy: SCSS files
// -------------------------------------
gulp.task('copy:sass', function() { 
  return gulp.src(gConfig.src.srcSassCopy) 
    .pipe(gulp.dest(gConfig.src.destSassCopy))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      });
});
// -------------------------------------
//   Task: Fix: SCSS files
// -------------------------------------
gulp.task('fix:sass', function() {
	return gulp.src(gConfig.src.srcSassFix)
		.pipe(plugins.replaceTask({
			patterns: [{
				match: /0px/g,
				replacement: '0'
			}]
		}))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
		.pipe(gulp.dest(gConfig.src.destSassFix));
});
// -------------------------------------
//   Task: Compile: SCSS files
// -------------------------------------
gulp.task('compile:sass', function() {
  return gulp.src(gConfig.src.srcSassComp())
    .pipe(plugins.sass.sync())
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
    .pipe(gulp.dest(gConfig.src.destSassComp));
});
// -------------------------------------
//   Task: Fix: CSS files, Part 1
// -------------------------------------
gulp.task('fix:css:retina', function() {
  return gulp.src(gConfig.src.srcCssRetina)
    .pipe(plugins.replaceTask(gConfig.options.ssRetina))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
		.pipe(gulp.dest(gConfig.src.destCssRetina));
});
// -------------------------------------
//   Task: Fix: CSS files, Part 2
// -------------------------------------
gulp.task('fix:css:sprites', function() {
  return gulp.src(gConfig.src.srcCssSprites)
    .pipe(plugins.replaceTask(gConfig.options.cssSprites))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
		.pipe(gulp.dest(gConfig.src.destCssSprites));
});
// -------------------------------------
//   Task: Fix and Reorder: CSS files
// -------------------------------------
gulp.task('prefix:css', function() {
    var autoprefixer = require('autoprefixer');
    return gulp.src(gConfig.src.srcCssPrefix())
        .pipe(plugins.postcss([
          autoprefixer(gConfig.options.autoprefBrowsers)
        ]))
          .on('error', function(err) {
            plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
            this.emit('end');
          })
        .pipe(plugins.csscomb(gConfig.options.autoprefSorter))
          .on('error', function(err) {
            plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
            this.emit('end');
          })
        .pipe(isProduction ? plugins.base64() : plugins.util.noop())
          .on('error', function(err) {
            plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
            this.emit('end');
          })
        .pipe(gulp.dest(gConfig.src.destCssPrefix));
});
// -------------------------------------
//   Task: Lint: CSS files
// -------------------------------------
gulp.task('lint:css', function() {
  return gulp.src(gConfig.src.srcCssLint())
    .pipe(isProduction ? plugins.util.noop() : plugins.stylelint(gConfig.options.lintCss))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      });
});
// -------------------------------------
//   Task: Generate: CSS statistics
// -------------------------------------
gulp.task('gen:cssStats', function() {
  return gulp.src(gConfig.src.srcCssStat())
    .pipe(isProduction ? plugins.util.noop() : plugins.parker(gConfig.options.parkerConf))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      });
});
// -------------------------------------
//   Task: Minify: CSS files
// -------------------------------------
gulp.task('minify:css', function() {
  return gulp.src(gConfig.src.srcCssMinify())
    .pipe(isProduction ? plugins.sourcemaps.init() : plugins.util.noop())
    .pipe(isProduction ? plugins.cssnano(gConfig.options.cssNano) : plugins.util.noop())
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(isProduction ? plugins.sourcemaps.write('.') : plugins.util.noop())
    .pipe(gulp.dest(gConfig.src.paths.styles.prod))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      });
});
// -------------------------------------
//   MultiTask: Style tasklist
// -------------------------------------
gulp.task('styleBuild', function(done) {
  runSequence(['copy:sass'], 'fix:sass', 'compile:sass',  'fix:css:retina', 'fix:css:sprites', 'prefix:css', 'lint:css', 'minify:css', function() {
    done();
  });
});


// -------------------------------------
//   MultiTask: Whole build procedure
// -------------------------------------
gulp.task('buildAll', function(done) {
  runSequence(['clear:all'], 'imageBuild', 'styleBuild', 'scriptBuild', function(error) {
    if (error) console.log(error.message);
    done();
  });
});


// -------------------------------------
//   MultiTask: Extra tasklist
// -------------------------------------
// ----- Only for testing purposes -----
gulp.task('buildExtra', function(done) {
  runSequence(['copy:fonts', 'copy:index'], 'copy:fontsFinal', 'htmlBuild', function() {
    done();
  });
});


// -------------------------------------
//   MultiTask: Report/test tasklist
// -------------------------------------
gulp.task('buildReports', function(done) {
  runSequence('gen:todo', 'gen:cssStats', function() {
    done();
  });
});


// -------------------------------------
//   Task: Start local server
// -------------------------------------
gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: gConfig.src.basePaths.prod
    },
    startPath: './',
    open: true,
    reloadOnRestart: true,
    //logLevel: 'debug',
    logConnections: true
  });
});

// -------------------------------------
//   Task: Start watching local files
// -------------------------------------
gulp.task('nightWatch', ['serve'], function() {
    gulp.watch(gConfig.src.paths.styles.src + '**/*.scss', ['styleBuild']).on('change', function(evt) {
        changeEvent(evt);
    });
    gulp.watch(gConfig.src.paths.scripts.src + '**/*.js', ['scriptBuild']).on('change', function(evt) {
        changeEvent(evt);
    });
});
