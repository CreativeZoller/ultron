'use strict';
var runSequence = require('run-sequence');

module.exports = function (gulp, gConfig, plugins) {

  var isProduction = false;
  if(plugins.util.env.deploy === true) isProduction = true;
  var changeEvent = function(evt) {
      plugins.util.log('File', evt.path.replace(new RegExp('/.*(?=/' + gConfig.src.basePaths.src + ')/'), ''), 'was', evt.type);
  };


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
  //   MultiTask: Report/test tasklist
  // -------------------------------------
  gulp.task('buildReports', function(done) {
    runSequence('gen:todo', 'gen:cssStats', function() {
      done();
    });
  });

};
