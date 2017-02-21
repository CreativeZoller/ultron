'use strict';
var runSequence = require('run-sequence');

module.exports = function (gulp, gConfig, plugins) {

  var isProduction = false;
  if(plugins.util.env.deploy === true) isProduction = true;

  // -------------------------------------
  //   Task: Copy: SCSS files
  // -------------------------------------
  gulp.task('copy:sass', function() { 
    return gulp.src(gConfig.src.paths.styles.srcFiles) 
      .pipe(gulp.dest(gConfig.src.paths.styles.temp))
        .on('error', function(err) {
          plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
          this.emit('end');
        });
  });

  // -------------------------------------
  //   Task: Lint: SCSS files
  // -------------------------------------
  gulp.task('lint:scss', function() {
    return gulp.src(gConfig.src.paths.styles.tempFiles)
      .pipe(isProduction ? plugins.util.noop() : plugins.scssLint(gConfig.options.scssLint))
        .on('error', function(err) {
          plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
          this.emit('end');
        })
      .pipe(gulp.dest(gConfig.src.paths.destTest));
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
      .pipe(gulp.dest(gConfig.src.paths.styles.temp));
  });

  // -------------------------------------
  //   Task: Fix: CSS files - retina
  // -------------------------------------
  gulp.task('fix:css:retina', function() {
    return gulp.src('.tmp/scss/retinaSprites.css')
      .pipe(plugins.replaceTask(gConfig.options.fixRetina))
        .on('error', function(err) {
          plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
          this.emit('end');
        })
  		.pipe(gulp.dest(gConfig.src.paths.styles.temp));
  });

  // -------------------------------------
  //   Task: Fix and Reorder: CSS files
  // -------------------------------------
  gulp.task('prefix:css', function() {
      var autoprefixer = require('autoprefixer');
      return gulp.src(gConfig.src.srcCssPrefix())
          .pipe(plugins.postcss([autoprefixer(gConfig.options.autoPrefix)]))
            .on('error', function(err) {
              plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
              this.emit('end');
            })
          .pipe(plugins.csscomb(gConfig.options.cssComb))
            .on('error', function(err) {
              plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
              this.emit('end');
            })
          .pipe(gulp.dest(gConfig.src.paths.styles.temp));
  });

  // -------------------------------------
  //   Task: Lint: CSS files
  // -------------------------------------
  gulp.task('lint:css', function() {
    return gulp.src(gConfig.src.srcCssLint())
      .pipe(isProduction ? plugins.stylelint(gConfig.options.cssLint) : plugins.util.noop())
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
    runSequence(['copy:sass'], 'lint:scss', 'compile:sass',  'fix:css:retina', 'prefix:css', 'lint:css', 'minify:css', function() {
      done();
    });
  });

};
