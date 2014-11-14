/* global require, console */
var q = require('q');
var Zip = require('adm-zip');
var streamifier = require('streamifier');

var log = require('../../log');

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

function getZipFile(data, id, start) {
  var zipFile = new Zip();

  var prop;
  for(prop in data) {
    if(data.hasOwnProperty(prop)) {
      zipFile.addFile(start + id + prop + ".json",
          new Buffer(JSON.stringify(data[prop])));
    } 
  }

  var buf = zipFile.toBuffer();

  return {
    buffer: buf,
    stream: streamifier.createReadStream(buf)
  };
}

//
// This is a good example of a storage function
//
function getS3ZipUploader(awsOpts, s3opts) {
  return function(data, id, start) {

    var deferred = q.defer();

    // generate zip file
    var zipfile = getZipFile(data, id, start);
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
