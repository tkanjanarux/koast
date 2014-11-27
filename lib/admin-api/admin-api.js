/* global require, console */

'use strict';

var q = require('q');
var _ = require('underscore');
var express = require('express');
var backup = require('./backup/backup');
var mds = require('mongodump-stream');

function collectionToS3(key, stream, awsGlobal, awsS3) {
  return mds.dump.s3(key, stream, {
    key: awsGlobal.accessKeyId,
    secret: awsGlobal.secretAccessKey,
    bucket: awsS3.bucket
  }).then(function(res) {
    return res.Location; // TODO
  });
}

function allCollectionsToS3(mongoUri, collections, awsGlobal, awsS3) {
  console.log('outit');

  return function(backupId, start) {
    start = new Date(start);

    return mds.slurp.multiBinary(mongoUri, collections, function(stream, coll) {
      
      var d = start.getDate();
      var m = start.getMonth() + 1;
      var y = start.getFullYear();
      var h = start.getHours();
      var m = start.getMinutes();
      var s = start.getSeconds();

      var key = [y, '-', m, '-', d, '-', h, ':', m, ':', s,
           '_', backupId, '_', coll].join('');

      // return promise and resolve location
      return collectionToS3(key, stream, awsGlobal, awsS3);
    });
  };
}

function getS3BackupRouter(path, collections, mongoUri, awsConfig) {
  var router = express.Router();

  router.post(path, backup.initiateBackupHandler(
        allCollectionsToS3(mongoUri, collections,
          awsConfig.global, awsConfig.s3)));

  router.get(path + '/:backupId', backup.retrieveBackupStatus);

  return router;
}

/**
 * cb should return a promise that resolves when it's done
 */
function getAdminApiRouter(cb) {
  var router = express.Router();
  var apiMeta = {};

  var register = function(apiModule) {
    var pathMeta = _.map(apiModule.router.stack, function(r) {
      var route = r.route;
      
      return {
        path: route.path,
        methods: route.methods,
      }
    });

    apiMeta[apiModule.name] = {
      type: apiModule.type,
      paths: pathMeta
    };
  };

  return cb(register).then(function() {

    router.get('/discovery', function(req, res) {
      res.send(apiMeta);
    });

    return router;
  });
}

exports = module.exports = {

  getRouter: getAdminApiRouter,

  // Should I export this or configure it in getAdminApiRouter?
  getS3BackupRouter: getS3BackupRouter
};
