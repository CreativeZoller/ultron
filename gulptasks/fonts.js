'use strict';

module.exports = function (gulp, gConfig, plugins) {

  // -------------------------------------
  //   Task: Copy: FontAwesome icons
  // -------------------------------------
  gulp.task('copy:fonts', function() { 
    return gulp.src(gConfig.src.paths.fonts.srcFiles) 
      .pipe(gulp.dest(gConfig.src.paths.fonts.temp));
  });
  gulp.task('copy:fontsFinal', function() { 
    return gulp.src(gConfig.src.paths.fonts.tempFiles) 
      .pipe(gulp.dest(gConfig.src.paths.fonts.prod));
  });

};
