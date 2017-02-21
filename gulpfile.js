// *************************************
//
//   Gulpfile
//
// *************************************
//
// Available tasks w/ gulp naming tag
//  clear:all       Clear every temporary files & folders
//  copy:fonts      Copy FontAwesome icons to source
//  copy:fontsFinal Copy FontAwesome icons to final destination
//  copy:index      Copy test html file
//  lint:html       Lint Html files
//  inject:html     Inject to Html files
//  minify:html     Minify Html files
//  sprites:png     Spritesheet for Png, Jpg files
//  sprites:retina  Spritesheet for Retina files
//  sprites:svg     Spritesheet for SVG files
//  copy:images     Copy image files
//  minify:images   Optimise omage files
//  gen:TODO        Generate TODO file
//  gen:cssStats    Generate CSS statistics
//  lint:js         Lint JavaScript files
//  fix:js          Fix JavaScript files
//  concat:js       Concatenate JavaScript files
//  gen:modernizr   Generate Modernizr Scripts
//  minify:js       Minify JavaScript files
//  copy:sass       Copy 3rd-party SCSS files
//  fix:sass        Fix SCSS files
//  compile:sass    Compile SCSS files
//  fix:css:retina  Fix CSS files, Part 1
//  fix:css:sprites Fix CSS files, Part 2
//  prefix:css      Fix and reorder CSS files
//  lint:css        Lint CSS files
//  minify:css      Minify CSS files
//  serve           Start local server
//  htmlBuild       MultiTask: Html tasklist
//  imageBuild      MultiTask: Image tasklist
//  buildReports    MultiTask: Report/test tasklist
//  scriptBuild     MultiTask: Script tasklist
//  styleBuild      MultiTask: Style tasklist
//  buildAll        MultiTask: Whole build procedure
//  buildExtra      MultiTask: Extra tasklist > for tests
//  nightWatch      Start watching files after local server started
//
// *************************************
'use strict';
var gulp    = require('gulp'),
    plugins = require('gulp-load-plugins')({
        DEBUG: false,
        scope: 'devDependencies',
        camelize: true,
        pattern: ['gulp-*', 'gulp.*'],
        replaceString: /\bgulp[\-.]/
    }),
    taskPath = './gulptasks/',
    gConfig = require('./gulptasks/gulp-config'),
    runSequence = require('run-sequence');

require(taskPath + 'clean')(gulp, gConfig, plugins);
require(taskPath + 'reports')(gulp, gConfig, plugins);
require(taskPath + 'fonts')(gulp, gConfig, plugins);
require(taskPath + 'html')(gulp, gConfig, plugins);
require(taskPath + 'scripts')(gulp, gConfig, plugins);
require(taskPath + 'images')(gulp, gConfig, plugins);
require(taskPath + 'styles')(gulp, gConfig, plugins);
require(taskPath + 'server')(gulp, gConfig, plugins);

// -------------------------------------
//   MultiTask: Whole build procedure
// -------------------------------------
//   imageBuild: png spritesheet, png retina spritesheet, image copy, minify(prod)
//   stylebuild: scss copy, scss lint(dev), scss compile, retina scss fix, css autoprefix, css comb,
//               css lint(prod), minify(prod)
//   scriptBuild: comile js, js lint(dev), concatenate js, copy 3rd party js, minify js(prod)
// -------------------------------------
gulp.task('buildAll', function(done) {
  runSequence(['clear:all'], 'imageBuild', 'styleBuild', 'scriptBuild', function(error) {
    if (error) console.log(error.message);
    done();
  });
});

// -------------------------------------
//   MultiTask: Extra tasklist > for test purposes only
// -------------------------------------
//   fontsFinal: copy FontAwesome fonts
//   htmlBuild: lint html, inject minified styles and scripts to html
// -------------------------------------
gulp.task('buildExtra', function(done) {
  runSequence(['copy:fonts', 'copy:index'], 'copy:fontsFinal', 'htmlBuild', function() {
    done();
  });
});

//TODO: convert main.js into es2016 mode
//TODO: inject for karma_test with buildExtras
//TODO: update readme to v.2.1.0
//TODO: travis update for: gem install scss_lint | gem install scss_lint_reporter_checkstyle
