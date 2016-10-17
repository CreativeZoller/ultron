'use strict';
var del = require('del');

module.exports = function (gulp, gConfig, plugins) {

  // -------------------------------------
  //   Task: Clear: Everything
  // -------------------------------------
  gulp.task('clear:all', function () {
    return del(gConfig.src.srcCleanUp());
  });

};
