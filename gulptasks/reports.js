'use strict';
var runSequence = require('run-sequence');

module.exports = function (gulp, gConfig, plugins) {

  var isProduction = false;
  if(plugins.util.env.deploy === true) isProduction = true;

  // -------------------------------------
  //   Task: Generate: TODO file
  // -------------------------------------
  gulp.task('gen:todo', function() {
    return gulp.src(gConfig.src.srcTodo())
      .pipe(plugins.todo())
      .pipe(gulp.dest(gConfig.src.paths.destTest))
      .pipe(plugins.todo.reporter('json', gConfig.options.todo))
      .pipe(gulp.dest(gConfig.src.paths.destTest))
  });

  // -------------------------------------
  //   Task: Generate: CSS statistics
  // -------------------------------------
  gulp.task('gen:cssStats', function() {
    return gulp.src(gConfig.src.srcCssStat())
      .pipe(isProduction ? plugins.util.noop() : plugins.parker(gConfig.options.parker))
        .on('error', function(err) {
          plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
          this.emit('end');
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

};
