'use strict';
module.exports = function (config) {

  console.log("Here",process.cwd());
  return;
  config.set({
    basePath: 'client/',
    frameworks: ['mocha', 'chai', 'sinon'],
    files: ['bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            '**/*.js'],
    exclude: ['bower_compnents/*'],
    reporters: ['progress'],
    port: 9999,
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: true,
    browsers: ['Chrome'], // Alternatively: 'PhantomJS'
    captureTimeout: 6000,
    singleRun: false
  });
};
