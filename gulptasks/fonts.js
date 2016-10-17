'use strict';

module.exports = function (gulp, gConfig, plugins) {

  // -------------------------------------
  //   Task: Copy: FontAwesome icons
  // -------------------------------------
  gulp.task('copy:fonts', function() { 
    return gulp.src(gConfig.src.paths.fonts.src) 
      .pipe(gulp.dest(gConfig.src.paths.fonts.temp));
  });
  gulp.task('copy:fontsFinal', function() { 
    return gulp.src(gConfig.src.paths.fonts.tmp2) 
      .pipe(gulp.dest(gConfig.src.paths.fonts.prod));
  });

};
