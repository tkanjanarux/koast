/* global require, console */
var q = require('q');
var fs = require('fs');

var zip = require('./zip');
var log = require('../../log');


function getFSZipStorage(path) {
  return function(data, id, start) {
    var deferred = q.defer();

    var zipfile = zip.getZipFile(data, id, start);
    fs.writeFile(path, zipfile.buffer);

    return deferred.promise;
  };
}

exports = module.exports = {
  getFSZipStorage: getFSZipStorage
};
