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

var templateFiles = [__dirname + '/templates/**'];

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
      'koast': '0.4.x'
    };

    return pkg;
}

exports.seed = function() {

  inquirer.prompt(questions, function(answers) {

    var packageJson = JSON.stringify(makeNpmPackageData(answers));
    fs.writeFile('package.json', packageJson, function(err) {
      if(err) { throw err; }

      gulp.src(templateFiles)
        .pipe(conflict('./'))
        .pipe(gulp.dest('./'));

      gulp.src('./package.json')
        .pipe(install());
    });
  });
};
