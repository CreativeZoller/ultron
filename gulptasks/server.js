'use strict';
var runSequence = require('run-sequence'),
    browserSync = require('browser-sync');

module.exports = function (gulp, gConfig, plugins) {

  var isProduction = false;
  if(plugins.util.env.deploy === true) isProduction = true;
  var changeEvent = function(evt) {
      plugins.util.log('File', evt.path.replace(new RegExp('/.*(?=/' + gConfig.src.paths.src + ')/'), ''), 'was', evt.type);
  };

  // -------------------------------------
  //   Task: Start local server
  // -------------------------------------
  gulp.task('serve', function() {
    browserSync({
      server: {
        baseDir: gConfig.src.paths.prod
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
      gulp.watch(gConfig.src.paths.styles.srcFiles, ['styleBuild']).on('change', function(evt) {
          changeEvent(evt);
      });
      gulp.watch(gConfig.src.paths.scripts.srcFiles, ['scriptBuild']).on('change', function(evt) {
          changeEvent(evt);
      });
  });

};
