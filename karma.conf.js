module.exports = function(config) {
  'use strict';
  var configuration = {
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      { pattern: 'https://code.jquery.com/jquery-1.11.2.min.js', watched: false },
      '_Public/**/!(jquery|angular).min.js',
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
    plugins: [
      'karma-coverage',
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-spec-reporter'
    ],
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    preprocessors: {
        '_Public/**/!(jquery|angular).min.js': ['coverage']
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
