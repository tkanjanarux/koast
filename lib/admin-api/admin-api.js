/* global require, console */


'use strict';
var backup = require('backup/backup');
var express = require('express');

/*
 * apiConfig must have
 *
 * {
 *   backup: {
 *     collections: [
 *       'collections',
 *       'you-want',
 *       'to backup'
 *     ],
 *
 *     // if using fs backup
 *     path: "/path/to/backup/dir"
 *   },
 *
 *   // if using s3 backup
 *   aws: {
 *     global: {
 *       accessKeyId: "asd",
 *       secretAccessKey: "secret"
 *     },
 *
 *     s3: {
 *       bucket: "bucket name"
 *     }
 *   }
 * }
 *
 */

function getFSBackupRouter(apiConfig, connection) {
  var router = express.Router();

  router.post('/fs', backup.initiateBackupHandler(connection,
        apiConfig.backup.collections,
        backup.getFSZipStorage(apiConfig.backup.path)));

  router.get('/fs/:backupId', backup.retrieveBackupStatus);

  return router;
}



function getS3BackupRouter(apiConfig, connection) {
  var router = express.Router();

  router.post('/s3', backup.initiateBackupHandler(connection,
        apiConfig.backup.collections,
        backup.getS3ZipUploader(apiConfig.aws.global, apiConfig.aws.s3)));

  router.get('/s3/:backupId', backup.retrieveBackupStatus);

  return router;
}


function getAdminApiRouter(apiConfig, connection) {
  var apiRouter = express.Router();

  //configure this?

  return apiRouter;
}

exports = module.exports = {

  getRouter: getAdminApiRouter,

  // Should I export this or configure it in getAdminApiRouter?
  getS3BackupRouter: getS3BackupRouter
};
