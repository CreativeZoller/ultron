'use strict';
var runSequence = require('run-sequence');

module.exports = function (gulp, gConfig, plugins, supports) {

  var isProduction = false;
  if(plugins.util.env.deploy === true) isProduction = true;

  // -------------------------------------
  //   Task: Copy: Test html file
  // -------------------------------------
  gulp.task('copy:index', function() { 
    return gulp.src(gConfig.src.paths.srcView)
    .pipe(gulp.dest(gConfig.src.paths.prod)); 
  });

  // -------------------------------------
  //   Task: Lint: Html files
  // -------------------------------------
  gulp.task('lint:html', function() {
    return gulp.src(gConfig.src.paths.srcInjView)
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
    return gulp.src(gConfig.src.paths.srcInjView)
      .pipe(plugins.inject(gulp.src(gConfig.src.srcExInj(), {read: true}), {relative: true}))
        .on('error', function(err) {
          plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
          this.emit('end');
        })
      .pipe(plugins.replaceTask(gConfig.options.htmlInject))
        .on('error', function(err) {
          plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
          this.emit('end');
        })
      .pipe(gulp.dest(gConfig.src.paths.prod));
  });


  // -------------------------------------
  //   MultiTask: Html tasklist
  // -------------------------------------
  gulp.task('htmlBuild', function(done) {
    runSequence(['inject:html'], 'lint:html', function() {
      done();
    });
  });

};
