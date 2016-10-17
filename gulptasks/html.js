'use strict';
var runSequence = require('run-sequence');

module.exports = function (gulp, gConfig, plugins, supports) {

  var isProduction = false;
  if(plugins.util.env.deploy === true) isProduction = true;
  var changeEvent = function(evt) {
      plugins.util.log('File', evt.path.replace(new RegExp('/.*(?=/' + gConfig.src.basePaths.src + ')/'), ''), 'was', evt.type);
  };


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

};
