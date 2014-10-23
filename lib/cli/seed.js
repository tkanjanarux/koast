'use strict';

var fs = require('fs');
var gulp = require('gulp');
var install = require('gulp-install');
var conflict = require('gulp-conflict');
var inquirer = require('inquirer');

var koastAscii =
'  _                   _    \n'+ 
' | | _____   __ _ ___| |_  \n'+
' | |/ / _ \\ / _` / __| __|\n'+
' |   < (_) | (_| \\__ \\ |_\n'+
' |_|\\_\\___/ \\__,_|___/\\__| Is now initializing your app <3\n';

console.log(koastAscii);


var questions = [
  {
    type: 'input',
    name: 'packageName',
    message: 'Package name',
    default: 'koast-app'
  },

  {
    type: 'input',
    name: 'description',
    message: 'Description',
    default: 'A koast app'
  },

  {
    type: 'confirm',
    name: 'frontendDeps',
    message: 'Include frontend',
    default: true
  }
];

function makeNpmPackageData(answers) {
    var pkg = {};
    pkg.name = answers.packageName;
    pkg.version = '0.0.0';
    pkg.description = answers.description;
    pkg.dependencies = {
      'koast': 'latest'
    };
    pkg.main = 'server/app.js';
    pkg.scripts = {
      start: 'node server/app.js'
    };

    return pkg;
}

function makeBowerPackageData(answers) {
  var pkg = {};
  pkg.name = answers.packageName;
  pkg.version = '0.0.0';
  pkg.directory = 'client/bower_components';
  pkg.dependencies = {
    'koast-angular': 'latest',
    'angular-ui': 'latest',
    'angular-ui-router': 'latest'
  };

  return pkg;
}

function makeAppConfigJson(answers) {
  var config = {
    app: {
      portNumber: 3000,
      routes: [{
        route: '/api',
        type: 'module',
        module: 'server/api'
      }]
    }
  };

  if(answers.frontendDeps) {
    config.app.routes.push({
      route: '/',
      type: 'static',
      path: 'client'
    });
  }

  return config;
}

function writeToDest(globs, dest) {
  gulp.src(globs)
    .pipe(conflict(dest))
    .pipe(gulp.dest(dest));
}


var serverFiles = [__dirname + '/templates/server/**'];
var configFiles = [__dirname + '/templates/config/**'];
var clientFiles = [__dirname + '/templates/client/**'];


exports.seed = function() {

  inquirer.prompt(questions, function(answers) {

    function writeJsonFromGenerator(path, generator) {
      var json = JSON.stringify(generator(answers), undefined, 2);
      fs.writeFileSync(path, json);
    }

    var installFiles = ['./package.json'];

    // TODO pipe into gulp conflict
    writeJsonFromGenerator('package.json', makeNpmPackageData);

    // write config/app.json
    // TODO pipe into gulp conflict
    try {
      fs.mkdirSync('config');
    } catch(e) { /* TODO limit to EEXIST */ }

    writeJsonFromGenerator('config/app.json', makeAppConfigJson);

    writeToDest(serverFiles, './server');
    writeToDest(configFiles, './config');


    if(answers.frontendDeps) {
      try {
        fs.mkdirSync('client');
      } catch(e) { /* TODO limit to EEXIST */ }

      // TODO pipe into gulp conflict
      writeJsonFromGenerator('.bowerrc',
          function() { return { directory:"client/bower_components" } });
      writeJsonFromGenerator('bower.json', makeBowerPackageData);
      writeToDest(clientFiles, './client');
      installFiles.push('./bower.json');
    }

    gulp.src(installFiles)
      .pipe(install());
  });
};
