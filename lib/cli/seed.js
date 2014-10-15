'use strict';

var gulp = require('gulp');
var install = require('gulp-install');
var conflict = require('gulp-conflict');
var inquirer = require('inquirer');

var koastAscii =
'  _                   _    \n'+ 
' | | _____   __ _ ___| |_  \n'+
' | |/ / _ \\ / _` / __| __|\n'+
' |   < (_) | (_| \\__ \\ |_\n'+
' |_|\\_\\___/ \\__,_|___/\\__| The init process!\n';

console.log(koastAscii);

var templateFiles = [__dirname + '/templates/**'];

var questions = [
  {
    type: 'input',
    name: 'packageName',
    message: 'Package name',
    default: 'koast-app'
  }
];

exports.seed = function() {


                          


  inquirer.prompt(questions, function(answers) {
    console.log(answers);
    gulp.src(templateFiles)
      .pipe(conflict('./'))
      .pipe(gulp.dest('./'))
      .pipe(install());
  });

};
