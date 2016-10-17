// *************************************
//
//   Gulpfile
//
// *************************************
//
// Available tasks w/ gulp naming tag
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
gulp.task('buildAll', function(done) {
  runSequence(['clear:all'], 'imageBuild', 'styleBuild', 'scriptBuild', function(error) {
    if (error) console.log(error.message);
    done();
  });
});

// -------------------------------------
//   MultiTask: Extra tasklist > for tests
// -------------------------------------
gulp.task('buildExtra', function(done) {
  runSequence(['copy:fonts', 'copy:index'], 'copy:fontsFinal', 'htmlBuild', function() {
    done();
  });
});
