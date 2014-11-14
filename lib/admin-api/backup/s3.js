/* global require, console */
var q = require('q');

var log = require('../../log');
var zip = require('./zip');

//
// file is an object that should contain
// - key (string)
// - body (stream)
// - mimetype (string)
// - length (int)
// 
function s3backup(awsOpts, s3opts, file) {
  var AWS;
  var s3;

  try {
    AWS = require('aws-sdk');

    // Add properties of awsOpts to AWS.config
    AWS.config.update(awsOpts);

    s3 = new AWS.S3();
  } catch (e) {
    throw e;
  }

  var params = {
    Bucket: s3opts.bucket,
    Key: file.key,
    Body: file.body,
    ACL: s3opts.acl,
    ContentType: file.mimetype,
    ContentLength: file.length
  };

  console.log('params', params);

  var deferred = q.defer();

  s3.putObject(params, function (err) {
    if (err) {
      deferred.reject(err); 
    } else {
      var url = 'http://' + s3opts.bucket +
          '.s3-website-us-east-1.amazonaws.com/' + file.key;

      deferred.resolve(url);
    }
  });

  return deferred.promise;
}

//
// This is a good example of a storage function
//
function getS3ZipUploader(awsOpts, s3opts) {
  return function(data, id, start) {

    var deferred = q.defer();

    // generate zip file
    var zipfile = zip.getZipFile(data, id, start);
    var file = {
      body: zipfile.stream,
      length: zipfile.buffer.length,
      key: start + id + '.zip',
      mimetype: 'application/zip'
    };
  
    s3backup(awsOpts, s3opts, file)
      .then(function(url) {
        deferred.resolve(url);
      })
      .catch(function(err) {
        log.error(err);
        deferred.reject(err);
      });

    return deferred.promise;
  };
}

exports = module.exports = {
  getS3ZipUploader: getS3ZipUploader
};
