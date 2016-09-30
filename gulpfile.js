// *************************************
//
//   Gulpfile
//
// *************************************
//
// Available tasks w/ gulp naming tag
//   `build`
//   `buildAll`
//   `buildExtra`
//   `buildReports`
//   `htmlBuild`
//   `imageBuild`
//   `nightWatch`
//   `serve`
//   `scriptBuild`
//   `styleBuild`
//   `clear:all`
//   `clear:tempImages`
//   `clear:tempStyles`
//   `compile:sass`
//   `concat:js`
//   `copy:fonts`
//   `copy:images`
//   `copy:index`
//   `copy:sass`
//   `fix:js`
//   `fix:css:retina`
//   `fix:css:sprites`
//   `fix:sass`
//   `gen:cssStats`
//   `gen:modernizr`
//   `gen:todo`
//   `inject:html`
//   `lint:html`
//   `lint:css`
//   `lint:js`
//   `minify:css`
//   `minify:html`
//   `minify:images`
//   `minify:js`
//   `prefix:css`
//   `sprites:png`
//   `sprites:retina`
//   `sprites:svg`
//
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
    config = require('./gulptasks/config'),
    taskList = require('fs').readdirSync(taskPath);

function getTask(task) {
    return require(taskPath + task)(gulp, config, plugins);
}

// TODO proper testings: karma for 2e2 and jasmine for coverage like this (karma + phantomjs in jasmine)
// > http://syropia.net/journal/javascript-testing-with-jasmine-and-gulp-redux
// TODO: add mocha+jasmine testing with coverage report  > https://github.com/dylanb/gulp-coverage
// TODO: new backstop testing

// TODO: make travis use install.sh with chmod 777
// TODO: change to new commiting, also use it from now: check my emails by esailor


// TODO: egyenlore kiszedni, kesobb fixaltan feldarabolni
//taskList.forEach(getTask);
//gulp.task('cleanTasks', getTask('clean'));
//gulp.task('scriptTasks', getTask('scripts-all'));
// -------------------------------------
//   Modules > taskfiles
// -------------------------------------
//
// gulp              : The streaming build system
// gulp-autoprefixer : Prefix CSS
// gulp-coffee       : Compile CoffeeScript files
// gulp-coffeelint   : Lint your CoffeeScript
// gulp-concat       : Concatenate files
// gulp-csscss       : CSS redundancy analyzer
// gulp-jshint       : JavaScript code quality tool
// gulp-load-plugins : Automatically load Gulp plugins
// gulp-minify-css   : Minify CSS
// gulp-parker       : Stylesheet analysis tool
// gulp-plumber      : Prevent pipe breaking from errors
// gulp-rename       : Rename files
// gulp-sass         : Compile Sass
// gulp-svgmin       : Minify SVG files
// gulp-svgstore     : Combine SVG files into one
// gulp-uglify       : Minify JavaScript with UglifyJS
// gulp-util         : Utility functions
// gulp-watch        : Watch stream
// run-sequence      : Run a series of dependent Gulp tasks in order
//
// -------------------------------------
var del = require('del');
var fs = require('fs');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var through = require('through2');
var sprity = require('sprity');

var isProduction = false;
if(plugins.util.env.deploy === true) isProduction = true;
var changeEvent = function(evt) {
    plugins.util.log('File', evt.path.replace(new RegExp('/.*(?=/' + config.src.basePaths.src + ')/'), ''), 'was', evt.type);
};

// -------------------------------------
//   Task: Clear: Everything
// -------------------------------------
gulp.task('clear:all', function () {
  return del(config.src.srcCleanUp());
});



// -------------------------------------
//   Task: Generate: TODO file
// -------------------------------------
gulp.task('gen:todo', function() {
    return gulp.src(config.src.srcTodo())
        .pipe(plugins.todo())
        .pipe(gulp.dest(config.src.destTodo))
        .pipe(plugins.todo.reporter('json', {fileName: 'todo.json'}))
        .pipe(gulp.dest(config.src.destTodo))
});
// -------------------------------------
//   Task: Copy: FontAwesome icons
// -------------------------------------
gulp.task('copy:fonts', function() { 
  return gulp.src(config.src.paths.fonts.src) 
    .pipe(gulp.dest(config.src.paths.fonts.temp));
});
gulp.task('copy:fontsFinal', function() { 
  return gulp.src(config.src.paths.fonts.tmp2) 
    .pipe(gulp.dest(config.src.paths.fonts.prod));
});
// -------------------------------------
//   Task: Copy: Test html file
// -------------------------------------
gulp.task('copy:index', function() { 
  return gulp.src('index.html') 
  .pipe(gulp.dest(config.src.basePaths.prod)); 
});
// -------------------------------------
//   Task: Lint: Html files
// -------------------------------------
gulp.task('lint:html', function() {
  return gulp.src([config.src.basePaths.prod + '**/*.html', config.src.basePaths.root + '/*.html'])
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
  return gulp.src([config.src.basePaths.root + '*.html', config.src.basePaths.prod + '*.html'])
    .pipe(plugins.inject(gulp.src([config.src.paths.scripts.prod + '*.js', config.src.paths.styles.prod + '*.css'], {read: true}), {relative: true}))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
    .pipe(gulp.dest(config.src.basePaths.prod));
});
// -------------------------------------
//   Task: Minify: Html files
// -------------------------------------
gulp.task('minify:html', function() {
  return gulp.src(config.src.basePaths.prod + '*.html')
    .pipe(isProduction ? plugins.htmlmin(config.options.htmlMin) : plugins.util.noop())
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
		.pipe(gulp.dest(config.src.basePaths.prod));
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
  return gulp.src(config.src.srcJSLint)
    .pipe(plugins.changed(config.src.paths.scripts.src))
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
  return gulp.src(config.src.srcJSLint)
    .pipe(plugins.changed(config.src.paths.scripts.src))
    .pipe(isProduction ? plugins.util.noop() : plugins.fixmyjs())
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
    .pipe(gulp.dest(config.src.paths.scripts.src));
});
// -------------------------------------
//   Task: Generate: Modernizr Scripts
// -------------------------------------
gulp.task('gen:modernizr', function() {
  return gulp.src(config.src.srcJSLint)
    .pipe(plugins.modernizr(config.options.modernizr))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
    .pipe(gulp.dest(config.src.paths.scripts.prod))
});
// -------------------------------------
//   Task: Concatenate: JavaScript files
// -------------------------------------
gulp.task('concat:js', function() {
  return gulp.src(config.src.srcJSLint)
    .pipe(plugins.concat(config.src.ccJSName))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
    .pipe(gulp.dest(config.src.paths.scripts.temp));
});
// -------------------------------------
//   Task: Minify: JavaScript files
// -------------------------------------
gulp.task('minify:js', function() {
  return gulp.src(config.src.paths.scripts.temp + config.src.ccJSName)
    .pipe(isProduction ? plugins.sourcemaps.init() : plugins.util.noop())
    .pipe(plugins.rename('main.min.js'))
    .pipe(isProduction ? plugins.uglify() : plugins.util.noop())
    .pipe(isProduction ? plugins.sourcemaps.write('.') : plugins.util.noop())
    .pipe(gulp.dest(config.src.paths.scripts.prod))
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
    var spritePngs = gulp.src(config.src.paths.images.src + '*.{png,jpg}')
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
    spritePngs.img.pipe(gulp.dest(config.src.paths.images.temp));
    spritePngs.css.pipe(gulp.dest(config.src.paths.styles.temp));
});

// -------------------------------------
//   Task: Spritesheet: Retina files
// -------------------------------------
gulp.task('sprites:retina', function() {
  var spriteData = gulp.src(config.src.srcRetineSprites)
    .pipe(plugins.spritesmith({
      algorithm: 'binary-tree',
      retinaSrcFilter: config.src.srcBRetinaSprites,
      imgName: config.src.nameRetinaImg,
      retinaImgName: config.src.nameBRetinaImg,
      cssName: config.src.nameRetinaCss
    }))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
  spriteData.img.pipe(gulp.dest(config.src.destRetinaImg));
  spriteData.css.pipe(gulp.dest(config.src.destRetinaCss));
});
// -------------------------------------
//   Task: Spritesheet: SVG files
// -------------------------------------
gulp.task('sprites:svg', function() {
  return gulp.src(config.src.srcSvgSprites)
    .pipe(plugins.svgSprite(config.options.svgSprite))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
    .pipe(gulp.dest(config.src.destSvgSprites));
});
// -------------------------------------
//   Task: Copy: Image files
// -------------------------------------
gulp.task('copy:images', function() { 
  return gulp.src(config.src.srcImages) 
    .pipe(gulp.dest(config.src.destImages))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      });
});
// -------------------------------------
//   Task: Minify: Image files
// -------------------------------------
gulp.task('minify:images', function() {
  return gulp.src(config.src.srcMinifyImf)
    .pipe(isProduction ? plugins.imagemin(config.options.imageMin) : plugins.util.noop())
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
    .pipe(gulp.dest(config.src.paths.images.prod));
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
  return gulp.src(config.src.srcSassCopy) 
    .pipe(gulp.dest(config.src.destSassCopy))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      });
});
// -------------------------------------
//   Task: Fix: SCSS files
// -------------------------------------
gulp.task('fix:sass', function() {
	return gulp.src(config.src.srcSassFix)
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
		.pipe(gulp.dest(config.src.destSassFix));
});
// -------------------------------------
//   Task: Compile: SCSS files
// -------------------------------------
gulp.task('compile:sass', function() {
  return gulp.src(config.src.srcSassComp())
    .pipe(plugins.sass.sync())
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
    .pipe(gulp.dest(config.src.destSassComp));
});
// -------------------------------------
//   Task: Fix: CSS files, Part 1
// -------------------------------------
gulp.task('fix:css:retina', function() {
  return gulp.src(config.src.srcCssRetina)
    .pipe(plugins.replaceTask(config.options.ssRetina))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
		.pipe(gulp.dest(config.src.destCssRetina));
});
// -------------------------------------
//   Task: Fix: CSS files, Part 2
// -------------------------------------
gulp.task('fix:css:sprites', function() {
  return gulp.src(config.src.srcCssSprites)
    .pipe(plugins.replaceTask(config.options.cssSprites))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      })
		.pipe(gulp.dest(config.src.destCssSprites));
});
// -------------------------------------
//   Task: Fix and Reorder: CSS files
// -------------------------------------
gulp.task('prefix:css', function() {
    var autoprefixer = require('autoprefixer');
    return gulp.src(config.src.srcCssPrefix())
        .pipe(plugins.postcss([
          autoprefixer(config.options.autoprefBrowsers)
        ]))
          .on('error', function(err) {
            plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
            this.emit('end');
          })
        .pipe(plugins.csscomb(config.options.autoprefSorter))
          .on('error', function(err) {
            plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
            this.emit('end');
          })
        .pipe(isProduction ? plugins.base64() : plugins.util.noop())
          .on('error', function(err) {
            plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
            this.emit('end');
          })
        .pipe(gulp.dest(config.src.destCssPrefix));
});
// -------------------------------------
//   Task: Lint: CSS files
// -------------------------------------
gulp.task('lint:css', function() {
  return gulp.src(config.src.srcCssLint())
    .pipe(isProduction ? plugins.util.noop() : plugins.stylelint(config.options.lintCss))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      });
});
// -------------------------------------
//   Task: Generate: CSS statistics
// -------------------------------------
gulp.task('gen:cssStats', function() {
  return gulp.src(config.src.srcCssStat())
    .pipe(isProduction ? plugins.util.noop() : plugins.parker(config.options.parkerConf))
      .on('error', function(err) {
        plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
        this.emit('end');
      });
});
// -------------------------------------
//   Task: Minify: CSS files
// -------------------------------------
gulp.task('minify:css', function() {
  return gulp.src(config.src.srcCssMinify())
    .pipe(isProduction ? plugins.sourcemaps.init() : plugins.util.noop())
    .pipe(isProduction ? plugins.cssnano(config.options.cssNano) : plugins.util.noop())
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(isProduction ? plugins.sourcemaps.write('.') : plugins.util.noop())
    .pipe(gulp.dest(config.src.paths.styles.prod))
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
//   MultiTask: Report/test tasklist
// -------------------------------------
gulp.task('buildReports', function(done) {
  runSequence('gen:todo', 'gen:cssStats', /* coverage and other will come here,*/ function() {
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
//   Task: Start local server
// -------------------------------------
gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: config.src.basePaths.prod
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
    gulp.watch(config.src.paths.styles.src + '**/*.scss', ['styleBuild']).on('change', function(evt) {
        changeEvent(evt);
    });
    gulp.watch(config.src.paths.scripts.src + '**/*.js', ['scriptBuild']).on('change', function(evt) {
        changeEvent(evt);
    });
});
