'use strict';
var runSequence = require('run-sequence');

module.exports = function (gulp, gConfig, plugins) {

  var isProduction = false;
  if(plugins.util.env.deploy === true) isProduction = true;
  var changeEvent = function(evt) {
      plugins.util.log('File', evt.path.replace(new RegExp('/.*(?=/' + gConfig.src.basePaths.src + ')/'), ''), 'was', evt.type);
  };


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

};
