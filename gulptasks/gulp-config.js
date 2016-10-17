'use strict';
var pngQuant = require('imagemin-pngquant');

module.exports = {
  src: {
    basePaths : {
        root: './',
        src: 'src/',
        prod: '_Public/',
        temp: '.tmp/',
        bower: 'bower_components/',
        test: 'src/tests/',
        devFiles: '_Development/**/*',
        prodFiles: '_Public/**/*',
        tempFiles: '.tmp/**/*',
        srcFonts: 'src/scss/fonts/*',
        srcMaps: 'src/**/*.map',
        srcView: 'Extra/index.html'
    },
    paths : {
        images: {
          src: 'src/images/',
          temp: '.tmp/images/',
          prod: '_Public/images/'
        },
        scripts: {
          src: 'src/scripts/',
          temp: '.tmp/scripts/',
          prod: '_Public/scripts/'
        },
        styles: {
          src: 'src/scss/',
          temp: '.tmp/scss/',
          prod: '_Public/styles/'
        },
        fonts: {
          src: 'bower_components/font-awesome/fonts/**.*',
          temp: 'src/scss/fonts/',
          tmp2: 'src/scss/fonts/**.*',
          prod: '_Public/fonts/',
        }
    },

    srcCleanUp: function () {
      return ['_Public/**/*', '.tmp/**/*', 'src/scss/fonts/*', 'src/**/*.map',
        'results/*'];
    },
    srcJSLint: 'src/scripts/*.js',
    ccJSName: 'main.js',
    srcTodo: function () {
      return ['**/*.html', '**/*.sh', '**/*.js', '**/*.scss', '**/*.css', '!_*', '!node_modules/**/*',
        '!bower_components/**/*', '!backstop_data/**/*', '!src/images/**/*'];
    },
    destTodo: 'results/',
    srcPngSprites : 'src/images/*.{png,jpg}',
    namePngSprites: 'src/scss/sprites.scss',
    srcRetineSprites: 'src/images/sprites2x/*.png',
    srcBRetinaSprites: 'src/images/sprites2x/*@2x.png',
    nameRetinaCss: 'retinaSprites.scss',
    nameRetinaImg: 'spritesheet.png',
    nameBRetinaImg: 'retinaSprites.png',
    destRetinaImg: '.tmp/images/',
    destRetinaCss: '.tmp/scss/',
    srcSvgSprites: 'src/images/**/*.svg',
    destSvgSprites: '.',
    srcImages: 'src/images/*.{gif,jpg,png,svg}',
    destImages: '.tmp/images/',
    srcMinifyImf: '.tmp/images/*.{gif,jpg,png,svg}',
    srcSassCopy: 'src/scss/**/*.scss',
    destSassCopy: '.tmp/scss/',
    srcSassLint: function () {
      return ['.tmp/scss/**/*.scss', '!.tmp/scss/includes/*.scss', '!.tmp/scss/bootstrap.scss',
        '!.tmp/scss/fontawesome.scss', '!.tmp/scss/sprites.scss', '!.tmp/scss/retinaSprites.scss',
        '!.tmp/scss/svg_sprites.scss'];
    },
    srcSassFix: '.tmp/scss/**/*.scss',
    destSassFix: '.tmp/scss/',
    srcSassComp: function () {
      return ['.tmp/scss/*.scss', '!.tmp/scss/sprites.scss', '!.tmp/scss/retinaSprites.scss',
        '!.tmp/scss/svg_sprites.scss']
    },
    destSassComp: '.tmp/scss/',
    srcCssRetina: '.tmp/scss/retinaSprites.css',
    destCssRetina: '.tmp/scss/',
    srcCssSprites: '.tmp/scss/main.css',
    destCssSprites: '.tmp/scss/',
    srcCssPrefix: function () {
      return ['.tmp/scss/*.css', '!.tmp/scss/bootstrap.css', '!.tmp/scss/*.min.css']
    },
    destCssPrefix: '.tmp/scss/',
    srcCssLint: function () {
      return ['.tmp/scss/*.css', '!.tmp/scss/*.min.css', '!.tmp/scss/bootstrap.css',
        '!.tmp/scss/fontawesome.css']
    },
    srcCssStat: function () {
      return ['.tmp/scss/*.css', '!.tmp/scss/*.min.css', '!.tmp/scss/bootstrap.css',
        '!.tmp/scss/fontawesome.css']
    },
    srcCssMinify: function () {
      return ['.tmp/scss/*.css', '!.tmp/scss/*.min.css']
    }
  },
  options: {
    htmlMin: {
      removeComments: true,
			removeCommentsFromCDATA: true,
			removeCDATASectionsFromCDATA: true,
			collapseWhitespace: true,
			collapseInlineTagWhitespace: true,
			conservativeCollapse: true,
			preserveLineBreaks: true,
			removeScriptTypeAttributes: true
    },
    modernizr: {
      'classPrefix': 'has-',
      'options': [
        'addTest',
        'setClasses',
        'testAllProps'
      ],
      'feature-detects': [
        "audio",
        "canvas",
        "cookies",
        "css/all",
        "dom/microdata",
        "es5/array",
        "es6/array",
        "geolocation",
        "inputtypes",
        "json",
        "queryselector",
        "svg",
        "userdata",
        "webanimations"
      ]
    },
    svgSprite: {
      dest : './',
      shape : {
        dimension : {
          maxWidth: 128,
          maxHeight: 128
        },
        spacing: {
          padding: 10
        }
      },
      mode : {
        css : {
          dest : './',
          sprite : '.tmp/images/sprites.svg',
          render : {
            scss : {
              dest : '.tmp/scss/svg_sprites.scss'
            }
          }
        }
      }
    },
    imageMin: {
      progressive: true,
      interlaced: true,
      optimizationLevel: 7,
      use: [pngQuant()]
    },
    ssRetina: {
      patterns: [{
				match: /sprite/g,
				replacement: '../images/sprite'
			}]
    },
    cssSprites: {
      patterns: [{
				match: /tmp/g,
				replacement: '.'
			}]
    },
    autoprefBrowsers: {
      browsers: ['> 10%', 'last 2 Chrome versions', 'last 2 Firefox versions', 'last 2 Opera versions', 'last 2 Safari versions', 'not ie <= 10']
    },
    autoprefSorter: {
      config: 'csscomb.json'
    },
    lintCss: {
      failAfterError: false,
      reportOutputDir: '.',
      reporters: [
        {formatter: 'verbose', console: true},
        {formatter: 'json', save: 'results/css-report.json'}
      ],
      debug: true
    },
    parkerConf: {
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
    smtg: {}
  }
};
