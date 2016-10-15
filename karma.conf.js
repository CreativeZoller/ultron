module.exports = function(config) {
  'use strict';
  var configuration = {
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'src/scripts/*.js',
      'src/tests/myKarmaTests.js'
    ],
    browsers : ['PhantomJS'],
    singleRun : true,
    reporters: ['progress','coverage'],
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
    preprocessors: {
        'src/**/*.js': ['coverage']
    },
    coverageReporter: {
        dir: 'results/coverage/',
        reporters: [
            { type: 'lcov', subdir: 'report-lcov' },
            { type: 'text-summary', subdir: '.', file: 'coverage-summary.txt' },
            { type: 'text' },
        ]
    },
  };
  config.set(configuration);
  if (process.env.TRAVIS) {
    configuration.browsers = ['Chrome_travis_ci'];
  }
}
