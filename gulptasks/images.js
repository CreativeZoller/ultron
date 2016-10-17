'use strict';
var runSequence = require('run-sequence');

module.exports = function (gulp, gConfig, plugins) {

  var isProduction = false;
  if(plugins.util.env.deploy === true) isProduction = true;
  var changeEvent = function(evt) {
      plugins.util.log('File', evt.path.replace(new RegExp('/.*(?=/' + gConfig.src.basePaths.src + ')/'), ''), 'was', evt.type);
  };


  // -------------------------------------
  //   Task: Spritesheet: Png, Jpg files
  // -------------------------------------
  gulp.task('sprites:png', function() {
      var spritePngs = gulp.src(gConfig.src.paths.images.src + '*.{png,jpg}')
        .pipe(plugins.spritesmith({
          algorithm: 'binary-tree',
          cssFormat: 'sass',
          imgName: 'sprites.png',
          cssName: 'sprites.scss',
        }))
          .on('error', function(err) {
            plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
            this.emit('end');
          })
      spritePngs.img.pipe(gulp.dest(gConfig.src.paths.images.temp));
      spritePngs.css.pipe(gulp.dest(gConfig.src.paths.styles.temp));
  });


  // -------------------------------------
  //   Task: Spritesheet: Retina files
  // -------------------------------------
  gulp.task('sprites:retina', function() {
    var spriteData = gulp.src(gConfig.src.srcRetineSprites)
      .pipe(plugins.spritesmith({
        algorithm: 'binary-tree',
        retinaSrcFilter: gConfig.src.srcBRetinaSprites,
        imgName: gConfig.src.nameRetinaImg,
        retinaImgName: gConfig.src.nameBRetinaImg,
        cssName: gConfig.src.nameRetinaCss
      }))
        .on('error', function(err) {
          plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
          this.emit('end');
        })
    spriteData.img.pipe(gulp.dest(gConfig.src.destRetinaImg));
    spriteData.css.pipe(gulp.dest(gConfig.src.destRetinaCss));
  });


  // -------------------------------------
  //   Task: Spritesheet: SVG files
  // -------------------------------------
  gulp.task('sprites:svg', function() {
    return gulp.src(gConfig.src.srcSvgSprites)
      .pipe(plugins.svgSprite(gConfig.options.svgSprite))
        .on('error', function(err) {
          plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
          this.emit('end');
        })
      .pipe(gulp.dest(gConfig.src.destSvgSprites));
  });


  // -------------------------------------
  //   Task: Copy: Image files
  // -------------------------------------
  gulp.task('copy:images', function() { 
    return gulp.src(gConfig.src.srcImages) 
      .pipe(gulp.dest(gConfig.src.destImages))
        .on('error', function(err) {
          plugins.util.log(plugins.util.colors.red.bold('[ERROR]:'),plugins.util.colors.bgRed(err.message));
          this.emit('end');
        });
  });


  // -------------------------------------
  //   Task: Minify: Image files
  // -------------------------------------
  gulp.task('minify:images', function() {
    return gulp.src(gConfig.src.srcMinifyImf)
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
    runSequence(['sprites:png', 'sprites:retina', 'sprites:svg'], 'copy:images', 'minify:images', function() {
      done();
    });
  });

};
