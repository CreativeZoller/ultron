'use strict';
var runSequence = require('run-sequence');

module.exports = function (gulp, gConfig, plugins) {

  var isProduction = false;
  if(plugins.util.env.deploy === true) isProduction = true;

  // -------------------------------------
  //   Task: Copy: 3rd party JS files
  // -------------------------------------
  gulp.task('copy:js', function() {
    return gulp.src(gConfig.src.paths.scripts.srcThirdPt)
      .pipe(gulp.dest(gConfig.src.paths.scripts.prod))
        .on('error', function(err) {
          plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
          this.emit('end');
        });
  });

  // -------------------------------------
  //   Task: Compile: JavaScript files
  // -------------------------------------
  gulp.task('compile:js', function() {
    return gulp.src(gConfig.src.paths.scripts.srcFiles)
      .pipe(plugins.babel(gConfig.options.babel))
        .on('error', function(err) {
          plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
          this.emit('end');
        })
      .pipe(gulp.dest(gConfig.src.paths.scripts.temp));
  });

  // -------------------------------------
  //   Task: Lint: JavaScript files
  // -------------------------------------
  gulp.task('lint:js', function() {
    return gulp.src(gConfig.src.paths.scripts.tempFiles)
      .pipe(isProduction ? plugins.util.noop() : plugins.jshint('.jshintrc'))
        .on('error', function(err) {
          plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
          this.emit('end');
        })
      .pipe(plugins.jshint.reporter('jshint-stylish'));
  });

  // -------------------------------------
  //   Task: Concatenate: JavaScript files
  // -------------------------------------
  gulp.task('concat:js', function() {
    return gulp.src(gConfig.src.paths.scripts.tempFiles)
      .pipe(plugins.concat('main.js'))
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
    return gulp.src(gConfig.src.paths.scripts.temp + 'main.js')
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
    runSequence(['compile:js'], 'lint:js', 'concat:js', 'copy:js', 'minify:js', function() {
      done();
    });
  });

};
