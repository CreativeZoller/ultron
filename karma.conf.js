// Karma configuration
// Generated on Sun Mar 20 2016 00:46:10 GMT+0100 (CET)

module.exports = function(config) {
  var configuration = {
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'src/scripts/main.js',
      'src/tests/mySpec.js'
    ],
    browsers : ['PhantomJS'],
    singleRun : true,
    reporters: ['progress'],
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    concurrency: Infinity,
    phantomjsLauncher: {
      exitOnResourceError: true
    },
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
  };
  config.set(configuration);
  if (process.env.TRAVIS) {
    configuration.browsers = ['Chrome_travis_ci'];
  }
}
