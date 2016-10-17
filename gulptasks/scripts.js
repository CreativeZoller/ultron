'use strict';
var runSequence = require('run-sequence');

module.exports = function (gulp, gConfig, plugins) {

  var isProduction = false;
  if(plugins.util.env.deploy === true) isProduction = true;
  var changeEvent = function(evt) {
      plugins.util.log('File', evt.path.replace(new RegExp('/.*(?=/' + gConfig.src.basePaths.src + ')/'), ''), 'was', evt.type);
  };


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

};
