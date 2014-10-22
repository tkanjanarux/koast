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

    return pkg;
}

function makeBowerPackageData(answers) {
  var pkg = {};
  pkg.name = answers.packageName;
  pkg.version = '0.0.0';
  pkg.dependencies = {
    'koast-angular': 'latest',
    'angular-ui': 'latest',
    'angular-ui-router': 'latest'
  };

  return pkg;
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
    var installFiles = ['./package.json'];

    var packageJson = JSON.stringify(makeNpmPackageData(answers));
    fs.writeFileSync('package.json', packageJson);

    writeToDest(serverFiles, './server');
    writeToDest(configFiles, './config');

    if(answers.frontendDeps) {
      var bowerJson = JSON.stringify(makeBowerPackageData(answers));
      fs.writeFileSync('bower.json', bowerJson);

      writeToDest(clientFiles, './client');

      installFiles.push('./bower.json');
    }

    gulp.src(installFiles)
      .pipe(install());
  });
};
