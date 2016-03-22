// Karma configuration
// Generated on Sun Mar 20 2016 00:46:10 GMT+0100 (CET)

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'src/scripts/main.js',
      'src/tests/mySpec.js'
    ],
    browsers : ['PhantomJS','Chrome'],
    singleRun : true,
    reporters: ['progress'],
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    concurrency: Infinity,
    phantomjsLauncher: {
      exitOnResourceError: true
    }
  })
}
