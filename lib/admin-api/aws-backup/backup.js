/* global require, console */
var q = require('q');
var _ = require('underscore');
var uuid = require('uuid');
var mongoose = require('mongoose');
var Zip = require('adm-zip');
var streamifier = require('streamifier');

var log = require('../../log');

'use strict';

var liveBackups = {};

function getModel(connection, col) {
  return connection.model(col, function(err, res) {
    if(err) { throw err; }
  });
}

// Returns a promise containing the entirety of a model's data
/*
function dumpCollection(connection, coll) {
  var model = getModel(connection, coll);

  //FIXME denodeify
  var deferred = q.defer();
  model.find({}, function (error, result) {
    if(error) {
      deferred.reject(error);
    } else {
      deferred.resolve(result);
    }
  });
  return deferred.promise;
}
*/

function dumpCollection(conn, coll) {
  var deferred = q.defer();
  setTimeout(function() {
    deferred.resolve({'hi':coll});
  }, 50);
  return deferred.promise;
}

// This API sucks (get collection from req?)
//
// conn - Mongoose connection
// colls - Array of collections to backup
// 
function initiateBackupHandler(conn, colls, storage) {
  return function(req, res) {
  
    //TODO make assertions on parameters
  
    var backupId = uuid.v1();

    // mark as live
    liveBackups[backupId] = {
      finished: false,
      id: backupId,
      start: Date.now()
    };

    // write "receipt" to user
    res.send(liveBackups[backupId]);
    res.end();

    var dumpData = {};

    // A promise for each collection dumped
    var dumpPromises = _.map(colls, function(coll) {
      
      // TODO mock dumpCollection as setTimeout for tests
      return dumpCollection(conn, coll)
        .then(function(data) {
          // collect dump data
          dumpData[coll] = data;
        });
    });

    q.all(dumpPromises)
      .then(function() {

        // Similar to mocha
        // The user has to call this function when they want to mark completion
        // The user must return a URL that can be used to access the backup
        // you can pass in optional error parameter
        var doneFn = function(url, err) {
          liveBackups[backupId].finished = true;

          if(err) {
            liveBackups[backupId].success = false;
            liveBackups[backupId].end = Date.now();

            throw err; // FIXME
          }

          liveBackups[backupId].success = true;
          liveBackups[backupId].end = Date.now();
          liveBackups[backupId].url = url;
        };
        
        storage(dumpData, backupId, liveBackups[backupId].start, doneFn);

      }, log.error);

  };
}

function retrieveBackupStatus(req, res) {
  var backupId = req.param('backupId');
  res.send(liveBackups[backupId]);
}


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

  // TODO GENERATE URL

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
  return function(data, id, start, done) {

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
        done(url);
      })
      .catch(function(err) {
        log.error(err);
        done(null, err);
      });
  };
}

exports = module.exports = {
  initiateBackupHandler: initiateBackupHandler,
  retrieveBackupStatus: retrieveBackupStatus,
  getS3ZipUploader: getS3ZipUploader
};

