'use strict';

var gulp = require('gulp');
var rg = require('rangle-gulp');
var exec = require('child_process').exec;

rg.setLogLevel('info');

gulp.task('mocha', rg.mocha());

gulp.task('lint', rg.jshint({
  files: [
    'lib/**/*.js',
    'index.js',
    'examples/basic-express/client/app/app.js',
    'examples/basic-express/client/app/**/*.js',
    'examples/basic-express/server/app.js',
    'examples/basic-express/server/**/*.js'
  ]
}));

gulp.task('beautify', rg.beautify({
  files: []
}));


var docGlobs = ['index.js',
                'lib/**'];

gulp.task('jsdoc', function() {
  var cmdHead = 'jsdoc -d docs/html';
  var cmd = docGlobs.reduceRight(function(x, y) {
    return x + ' ' + y;
  }, cmdHead);

  console.log(cmd);

  exec(cmd, function(err, stdout, stderr) {
    if (err !== null) {
      console.log(stderr);
    } else {
      console.log('Compiled JSDoc', stdout);
    }
  });
});

gulp.task('jsdoc-watch', function() {
  gulp.watch(docGlobs, ['jsdoc']);
});



gulp.task('dev', rg.nodemon({
  // workingDirectory: 'examples/basic-express/',
  script: 'examples/basic-express/server/app.js',
  onChange: ['lint'] // or ['lint', 'karma']
}));

gulp.task('test', ['mocha']);

gulp.task('default', ['lint', 'concat', 'mocha']);
