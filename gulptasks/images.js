'use strict';
var runSequence = require('run-sequence');

module.exports = function (gulp, gConfig, plugins) {

  var isProduction = false;
  if(plugins.util.env.deploy === true) isProduction = true;

  // -------------------------------------
  //   Task: Spritesheet: Png, Jpg files
  // -------------------------------------
  gulp.task('sprites:png', function() {
      var spritePngs = gulp.src(gConfig.src.paths.images.srcSpriteFiles)
        .pipe(plugins.spritesmith(gConfig.options.sprites))
          .on('error', function(err) {
            plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
            this.emit('end');
          });
      spritePngs.img.pipe(gulp.dest(gConfig.src.paths.images.temp));
      spritePngs.css.pipe(gulp.dest(gConfig.src.paths.styles.temp));
  });

  // -------------------------------------
  //   Task: Spritesheet: Retina files
  // -------------------------------------
  gulp.task('sprites:retina', function() {
    var spriteData = gulp.src(gConfig.src.paths.images.srcRSpriteFiles)
      .pipe(plugins.spritesmith(gConfig.options.retinaSprites))
        .on('error', function(err) {
          plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
          this.emit('end');
        });
    spriteData.img.pipe(gulp.dest(gConfig.src.paths.images.temp));
    spriteData.css.pipe(gulp.dest(gConfig.src.paths.styles.temp));
  });

  // -------------------------------------
  //   Task: Copy: Image files
  // -------------------------------------
  gulp.task('copy:images', function() { 
    return gulp.src(gConfig.src.paths.images.srcFiles) 
      .pipe(gulp.dest(gConfig.src.paths.images.temp))
        .on('error', function(err) {
          plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
          this.emit('end');
        });
  });

  // -------------------------------------
  //   Task: Minify: Image files
  // -------------------------------------
  gulp.task('minify:images', function() {
    return gulp.src(gConfig.src.paths.images.tempFiles)
      .pipe(isProduction ? plugins.imagemin(gConfig.options.imageMin) : plugins.util.noop())
        .on('error', function(err) {
          plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
          this.emit('end');
        })
      .pipe(gulp.dest(gConfig.src.paths.images.prod));
  });


  // -------------------------------------
  //   MultiTask: Image tasklist
  // -------------------------------------
  gulp.task('imageBuild', function(done) {
    runSequence(['sprites:retina', 'sprites:png'], 'copy:images', 'minify:images', function() {
      done();
    });
  });

};
