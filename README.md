# Ultron [![Build Status](https://travis-ci.org/CreativeZoller/ultron.svg?branch=master)](https://travis-ci.org/CreativeZoller/ultron)
## Synopsis
![Image of Ultron](http://goo.gl/JjKp7k)

Ultron is a development dependency for future projects. It is a basic frame for front-end tasks, including some test functions.
### Motivation
The purpose of this package is to make future work faster. In future projects there will be the ability to include this package and it will handle a lot of things instead of you. So you won't writing the corresponding codes again and again, wasting precious time with every project. Now with this package comes a lot of automated tasks such as compiles, and virtual server starts, hinting, unit tests and some other, partly pre-configured cool stuffs.
## Table of contents
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [Contributing](#contributing)
- [History](#history)

## Installation
After forking this to your project root, simply type
`npm install` into your terminal. For safest method type `rm -rf node_modules` before the previous command entered into your terminal.

If you have some other packages installed, try `npm prune` to uninstall not used and/or unnecessary modules.

I also suggest to configure the included [BackstopJS](https://github.com/garris/BackstopJS) module also, which checks the official Bootstrap by default.
### Dependencies
The package don't have any dependencies. But I recommend using of Gulp v3.9.1 or newer.

I used [Node v5.6.0](https://nodejs.org/en/download/releases/) and NPM v3.7.2(npm is installed as part of node with the linked installers) at the time of writing these lines.
## Usage
First -if you want- copy the content of the Extra folder to your forked root, and remove the Extra folder because you won't need it anymore.

Create a file in your root, name it secretConf.json, because this could be used in gulpfile. For example you can use your username and password for google as keys from this file.

After running `npm install && npm prune` you'll get every necessary package - and just them, you can use all the gulp commands. I recommend to run `gulp bower` because it will install all package from bower.json into the bower_components folder and also execute the prune command.

Now you can use the commands from [Tasks](#tasks) section below.
### Structure
In order to get the tasks work properly, gulp assumes you have the following project-structure:

````
.
├── src/
|	├── fonts/
|	├── images/
|	|	├── sprites/
|	|	├── sprites-2x/
|	|	└── svg/
|	├── scss/
|	|	├── block/
|	|	├── fonts/
|	|	├── includes/
|	|	└── mixins/
|	├── scripts/
|	└── tests/
├── .gitignore
├── .htmlhintrc
├── .jshintrc
├── bower.json
├── csscomb.json
├── package.json
├── gulpfile.js
└── README.md
````
I strongly recommend to make two files in `src/` to override the bower-bootstrap and font-awesome variables. For this purpose mine boilerplate files are included in the Extras folder as templates or for real usage also. For trying out the tasks I also recommend putting at least 2 images in every format to `src/images/`, and also some svg and png to the corresponding folders in order to get some sprites back. I also attached some of them in the Extras folder. Creating stylesheets for them is also recommended for full testing.
### Tasks
**`gulp bower`** -
Runs `bower install` command and get every modules to bower_components, after it removes all unnecessary modules.

**`gulp fonts`**
Copies the font-awesome fonts to your source folder.

**`gulp cleanUp`**
Cleans up the mess from compile folders, also removing every content of the development and deployment folders.

**`gulp imageBuild`**
Creates png sprites and svg prites, minifies all images and copies them to the development or deployment folders.

**`gulp scriptBuild`**
Concatenates script files, and minifies them to the development or deployment folders.

**`gulp styleBuild`**
Compiles sass files, and minifies them into the development or deployment folders.

**`gulp build / gulp build --deploy`**
Runs the build process -including cleanUp, image-, script- and styleBuilds- and runs tests and compiles every file to the development folder. With the --deploy attribute, it process the same tasks but with minifying the files and also without testing the files.

**`gulp serve`**
After development build process finishes, launches a virtual localhost server, and opens up the compiled files in your web-browser.
#### Tasks in details and flow of tasks
First of all, nearly every tasks have both development and production version, which can be called by typing `gulp TASKNAME --deploy` into command line.

`cleanUp` task will delete every compiled content from both development and production -related folders, and also from the temporary folders.

`bower` task will run the install and then the prune commands so you won't have any unnecessary packages in our bower folder.

`fonts` task copies all the font-awesome font-files to your source folder, so you could use it. There is a file for this in the Extra folder. There is also a file to show how to override Bootstrap variables with your own.

`index` is only for test purposes, if you work with templates and other elements this task is really unnevessary.

`checkHtml` task is for hinting all compiled html files with custom rules defined in .htmlhintrc file. It only works with basic/development mode. It will just pass every file if you run this with the --deploy addition.

`replaceHtml` is for dynamic injection of every necessary css and js files to the designated parts of our html files. It will change a lot in the near future, depending on the plans already lied down.

`minifyHtml` is for minify the fully processed html files.

`pngSprites` task creates png-spritesheet and corresponding stylesheet in scss format from every .png and .jpg files in the src/images folder.

`retinaSprites` task creates retina-diplay ready spritesheet and corresponding stylesheet in scss format from every paired (there is a normal named, and a FILENAME-2x named version of it) .png files in the src/images/sprites2x folder.

`svgSprites` task creates svg-spritesheet and corresponding stylesheet in scss format from every svg files in src/images folder.

`copyImgs` is just copies every unhandled images next to the temporary image-folder.

`imgMin` task is minifying every images from temporary image folder to the designated image folder, which depend on what mode you running it: development or production.

`copySass` task collects your scss files from the style source folder, and put them into the temporary style folder.

`replaceSassPx` task finds and replaces everywhere the 'px' values with 0 value to unitless values in the temporary folder.

`lintSass` task is for hinting your scss files through with predefinied rules.

`sassCompile` compiles every scss files to css.

`retinaSpriteUrl` replaces image urls in retinaSprites.scss.

`svgSpriteUrl` replaces image urls in svg_sprites.scss.

`preFix` task searches your compiled css files and add previously configured prefixes to them.

`cssLint` task is for hinting your compiled css files with predefinied rules.

`cssMin` is for minifying the compiled css files. If you run it in basic/development mode, the files will only be renamed, but the process will not minify the files, which is better in development.

`scriptLint` is for hinting your script files with custom rules predefined by .jshintrc file.

`scriptFix` task is trying to fix all the problems it found during the hinting. It often care about errors, but no warning and notification level problems.

`scriptModernizr` task is for generating a dynamic modernizr file. So instead of using some pre-downloaded one, you create it here, and can be customized every time by modifying the gulp task.

`concatScripts` is for concatenating all your temporary script files.

`scriptMin` is for minifying all your scripts. the designated folder depends on the mode you are running it, so with --deploy it will minify everything to the production script folder.

`nightWatch` is for Jon Snows, how doesn't know anything. bus since you're not jon Snow, this script is for watching all the source files during the local virtual server running, and if there any changes the corresponding tasks will be fired.

`serve` task has only one mode - development. Since I assume you will copy all the compiled files to your webserver or cloud host, running a local server only important during the development process.

`npm test` is not a gulp task, it's an Npm task which is execuiting our karma test. It is easy ot modify and you also have the Mocha option instead of using Karma.
### Using as dependency
You can use this repository as your base and advance it in your project after forking it, or you can use it as a submodule with the `git submodule add path_to_repo path_where_you_want_it` command. If you use by this way, you can run the `git submodule init` and `git submodule update` commands on occasion.

Please be aware if you want to build really a large applcation based on multiple dependencies, you shouldn't use submodules, but an appropriate dependency-tool instead, like [Bower](http://bower.io/), [Component.io](http://component.io/) or [Composer](https://getcomposer.org/), etc.
## Testing
Try run `npm test` to see if your Jasmine tests are working correctly. Specific test cases need to be implemented depending on your choice (this repo comes with jasmin, mocha and karma included), also there is a css-redundancy test which must be modified to your needs (now it tests bootstrap official).
## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History
**v.0.1.0**
first version of the Ultron package is made and published as GitHub repository
## Credits
My name is Zoltan Belicza, I am a FrontEnd Engineer. Number one contributor on this project. Catch me @ [LinkedIN](hu.linkedin.com/in/beliczazoltanjanos)
## License
Copyright (c) 2015, Zoltan Belicza
The [MIT License (MIT)](https://en.wikipedia.org/wiki/MIT_License)
