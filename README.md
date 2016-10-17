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
_Recommended Installation_

I created a shell script so after cloning this repo to your machine, you only need to make sure, give read permissions (or full) to that file by typing: **`chmod 777 ./install.sh`**. After it you can use **`./install.sh`** to start the installation process.

_Basic Installation_

Also you could do the old-fashioned way too. After forking this to your project root, simply type
**`npm install`** into your terminal. For safest method type **`rm -rf node_modules && rm -rf bower_components`** before the previous command entered into your terminal. If you have some other packages installed, try **`npm prune`** to uninstall not used and/or unnecessary modules.

I also suggest to configure the included [BackstopJS](https://github.com/garris/BackstopJS) module, which checks the official Bootstrap by default. So please modify for your own needs. For proper Backstop usage please install it also globally with **`npm install -g backstopjs`**.

### Dependencies
The package don't have any dependencies. But I recommend using of Gulp v3.9.1 or newer.

I used [Node v5.6.0](https://nodejs.org/en/download/releases/) and NPM v3.7.2(npm is installed as part of node with the linked installers) at the time of writing these lines.
## Usage
First -if you want- copy the content of the Extra folder to your forked root, and remove the Extra folder because you won't need it anymore. Otherwise create your own files.

After installing you'll get every necessary package.

Now you can use the commands from [Tasks](#tasks) section below.

With also installing the **`npm-check`** package, you can use it to interactively manage your outdated dependencies by typing in **`npm-check -u`**.

For checking dependencies (not 100% usable) install the depcheck package by **`npm i -g depcheck`** command and use it whenever you want with typing **`depcheck`**.
### Structure
In order to get the tasks work properly, gulp assumes you have the following project-structure at least:

````
.
├── gulptasks/
├── src/
|	├── fonts/
|	├── images/
|	|	├── sprites/
|	|	├── sprites-2x/
|	|	└── svg/
|	├── scripts/
|	├── scss/
|	|	├── block/
|	|	├── fonts/
|	|	├── includes/
|	|	└── mixins/
|	└── tests/
├── .gitignore
├── .htmlhintrc
├── .jshintrc
├── .stylehintrc
├── .travis.yml
├── backstop.json
├── bower.json
├── csscomb.json
├── custom.hbs
├── gulpfile.js
├── install.sh
├── karma.conf.json
├── package.json
└── README.md
````
If you are not using my Extra files, I highly recommend to make two files in `src/` to override the bower-bootstrap and font-awesome variables. For trying out the tasks I also recommend putting at least 2 images in every format to `src/images/`, and also some svg and png to the corresponding folders in order to get some sprites back. Creating stylesheets for them is also recommended for full testing.
### Main Tasks
**`gulp clear:all`** -
Clear every temporary and already compiled and/or optimised files from the specific folders. Use manually before running any task to get empty working folders.

**`gulp buildAll`** -
Runs a series of tasks to make you the proper outcome of all your fry files. You can use with ` --deploy` attribute so it will make the files deploy-ready.

**`gulp buildExtra`** -
Runs some other tasks by using the files from Extra folder and give some additional demo content to your compiled environment.

**`gulp serve`** -
Creates a webserver locally and fire up a browser for live checking.

**`gulp nightWatch`** -
After creating the virtual server locally, it fires up a series of watch tasks, looking for any modification in javascript and css files.

#### Task overview
First of all, nearly every tasks have both development and production version, which can be called by typing **`gulp TASKNAME --deploy`** into command line, just as mentined before.

**`copy:fonts`** - Copy FontAwesome icons to source folder

**`copy:fontsFinal`** - Copy FontAwesome icons to final destination.

**`copy:index`** - Copy test html file.

**`lint:html`** - Lint Html files.

**`inject:html`** - Inject to Html files.

**`minify:html`** - Minify Html files.

**`sprites:png`** - Creates spritesheet for Png, Jpg files.

**`sprites:retina`** - Creates spritesheet for Retina files.

**`sprites:svg`** - Creates spritesheet for SVG files.

**`copy:images`** - Copy image files.

**`minify:images`** - Optimise omage files.

**`gen:TODO`** - Generate TODO file.

**`gen:cssStats`** - Generate CSS statistics.

**`lint:js`** - Lint JavaScript files.

**`fix:js`** - Fix JavaScript files.

**`concat:js`** - Concatenate JavaScript files.

**`gen:modernizr`** - Generate Modernizr Scripts.

**`minify:js`** - Minify JavaScript files.

**`copy:sass`** - Copy 3rd-party SCSS files to source folder.

**`fix:sass`** - Fix SCSS files.

**`compile:sass`** - Compile SCSS files.

**`fix:css:retina`** - Fix CSS files, Part 1.

**`fix:css:sprites`** - Fix CSS files, Part 2.

**`prefix:css`** - Fix and reorder CSS files.

**`lint:css`** - Lint CSS files.

**`minify:css`** - Minify CSS files.

**`htmlBuild`** - MultiTask: Run html tasklist.

**`imageBuild`** - MultiTask: Run image tasklist.

**`buildReports`** - MultiTask: Run report/test tasklist.

**`scriptBuild`** - MultiTask: Run script tasklist.

**`styleBuild`** - MultiTask: Run style tasklist.

The following tasks are not Gulp tasks, so use them without any gulp prefix.

**`backstop reference`** - Creates and updates every image reference, based on the configurations in your backstop.json.

**`backstop test`** - Runs a test, based on your previously created references and your actual config from backstop.json.

**`npm test`** - Runs the jasmine unit-test with karma, and creates the coverage test for it with istanbul.

### Using as dependency
You can use this repository as your base and advance it in your project after forking it, or you can use it as a submodule with the **`git submodule add path_to_repo path_where_you_want_it`** command. If you use by this way, you can run the **`git submodule init`** and **`git submodule update`** commands on occasion.

Please be aware if you want to build really a large applcation based on multiple dependencies, you shouldn't use submodules, but an appropriate dependency-tool instead, like [Bower](http://bower.io/), [Component.io](http://component.io/) or [Composer](https://getcomposer.org/), etc.

## Testing
Try run **`npm test`** to see if your Jasmine tests are working correctly. It also generates an Istambul coverage-test so you can check how well do you test your scripts.

## Contributing
1. Fork it!
2. Create your feature branch: **`git checkout -b my-new-feature`**
3. Commit your changes: **`git commit -am 'Add some feature'`**
4. Push to the branch: **`git push origin my-new-feature`**
5. Submit a pull request :D

## History
**v.0.2.0**
Ultron package is updated, restructured and fastened up for more precise workflow

**v.0.1.0**
first version of the Ultron package is made and published as GitHub repository

## Credits
My name is Zoltan Belicza, I am a FrontEnd Engineer. Number one contributor on this project. Catch me @ [LinkedIN](hu.linkedin.com/in/beliczazoltanjanos)

## License
Copyright (c) 2015, Zoltan Belicza
The [MIT License (MIT)](https://en.wikipedia.org/wiki/MIT_License)
