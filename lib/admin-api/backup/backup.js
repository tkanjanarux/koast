/* global require, console */
var q = require('q');
var _ = require('underscore');
var uuid = require('uuid');
var mongoose = require('mongoose');

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

        storage(dumpData, backupId, liveBackups[backupId].start)
          .then(function(url) {
            liveBackups[backupId].finished = true;
            liveBackups[backupId].success = true;
            liveBackups[backupId].end = Date.now();
            liveBackups[backupId].url = url;
          }, function(err) {
            log.error(err);
            liveBackups[backupId].finished = true;
            liveBackups[backupId].success = false;
            liveBackups[backupId].end = Date.now();

            throw err; //FIXME
          });

      }, log.error);

  };
}

function retrieveBackupStatus(req, res) {
  var backupId = req.param('backupId');
  res.send(liveBackups[backupId]);
}


exports = module.exports = {
  initiateBackupHandler: initiateBackupHandler,
  retrieveBackupStatus: retrieveBackupStatus
};

