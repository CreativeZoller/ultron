'use strict';
var pngQuant = require('imagemin-pngquant');

module.exports = {
  src: {
    paths : {
      images: {
        prod: '_Public/images/',
        temp: '.tmp/images/',
        tempFiles: '.tmp/images/*.{gif,jpg,png,svg}',
        srcFiles: ['src/images/*.{gif,jpg,png,svg}', 'src/images/svg/*'],
        srcSpriteFiles: 'src/images/sprites/*.{png,jpg}',
        srcRSpriteFiles: 'src/images/sprites2x/*.png',
      },
      scripts: {
        prod: '_Public/scripts/',
        temp: '.tmp/scripts/',
        tempFiles: '.tmp/scripts/*.js',
        srcThirdPt: 'bower_components/jquery/dist/jquery.min.js',
        srcFiles: 'src/scripts/*.js',
      },
      styles: {
        prod: '_Public/styles/',
        temp: '.tmp/scss/',
        tempFiles: '.tmp/scss/*.scss',
        srcFiles: 'src/scss/**/*.scss',
      },
      fonts: {
        prod: '_Public/fonts/',
        temp: 'src/scss/fonts/',
        tempFiles: 'src/scss/fonts/*',
        srcFiles: 'bower_components/font-awesome/fonts/**.*',
      },
      prod: '_Public/',
      destTest: './results/',
      src: 'src/',
      srcView: 'Extra/index.html',
      srcInjView: '_Public/*.html',
    },
    srcCleanUp: function () {
      return ['_Public/**/*', '.tmp/**/*', 'src/scss/fonts/**/*', 'src/**/*.map', 'results/**/*'];
    },
    srcExInj: function () {
      return ['_Public/scripts/*.min.js', '_Public/styles/*.min.css'];
    },
    srcTodo: function () {
      return ['**/*.{html,sh,js,scss,css}', '!_*', '!node_modules/**/*',
        '!bower_components/**/*', '!backstop_data/**/*', '!src/images/**/*'];
    },
    srcCssStat: function () {
      return ['.tmp/scss/*.css', '!.tmp/scss/*.min.css', '!.tmp/scss/bootstrap.css',
        '!.tmp/scss/fontawesome.css'];
    },
    srcSassComp: function () {
      return ['.tmp/scss/*.scss', '!.tmp/scss/sprites.scss', '!.tmp/scss/retinaSprites.scss',
        '!.tmp/scss/svg_sprites.scss'];
    },
    srcCssPrefix: function () {
      return ['.tmp/scss/*.css', '!.tmp/scss/bootstrap.css', '!.tmp/scss/*.min.css'];
    },
    srcCssLint: function () {
      return ['.tmp/scss/*.css', '!.tmp/scss/*.min.css', '!.tmp/scss/bootstrap.css',
        '!.tmp/scss/fontawesome.css'];
    },
    srcCssMinify: function () {
      return ['.tmp/scss/*.css', '!.tmp/scss/*.min.css'];
    }
  },
  options: {
    sprites: {
      algorithm: 'binary-tree',
      imgName: 'sprites.png',
      cssName: 'sprites.scss'
    },
    retinaSprites: {
      algorithm: 'binary-tree',
      retinaSrcFilter: 'src/images/sprites2x/*@2x.png',
      imgName: 'spritesheet.png',
      retinaImgName: 'retinaSprites.png',
      cssName: 'retinaSprites.scss'
    },
    todo: {
      fileName: 'todo.json'
    },
    babel: {
      presets: ['es2015']
    },
    imageMin: {
      progressive: true,
      interlaced: true,
      optimizationLevel: 7,
      use: [pngQuant()]
    },
    fixRetina: {
      patterns: [{
				match: /sprite/g,
				replacement: '../images/sprite'
			}]
    },
    autoPrefix: {
      browsers: ['> 10%', 'last 2 Chrome versions', 'last 2 Firefox versions', 'last 2 Opera versions', 'last 2 Safari versions', 'not ie <= 10']
    },
    cssComb: {
      config: 'csscomb.json'
    },
    cssLint: {
      failAfterError: false,
      reportOutputDir: '.',
      reporters: [
        {formatter: 'verbose', console: true},
        {formatter: 'json', save: 'results/css-report.json'}
      ],
      debug: true
    },
    scssLint: {
      'config': '.scss_lint.yml',
      'reporterOutputFormat': 'Checkstyle',
      'filePipeOutput': 'scssReport.xml'
    },
    parker: {
      file: 'results/css-stats.md',
      title: 'Style statistics report',
      metrics: [
          "TotalRules",
          "TotalStylesheets",
          "TotalDeclarations",
          "TotalSelectors",
          "SelectorsPerRule",
          "TotalIdentifiers",
          "IdentifiersPerSelector",
          "UniqueColours",
          "TotalMediaQueries",
          "TotalImportantKeywords"
      ]
    },
    cssNano: {
      discardComments: true,
      mergeRules: true,
      orderedValues: true,
      discardDuplicates: true,
      discardEmpty: true
    },
    htmlInject: {
      patterns: [
        {
          match: /.css">/g,
          replacement: function () {
            return '.css" />';
          }
        }
      ]
    }
  }
}
