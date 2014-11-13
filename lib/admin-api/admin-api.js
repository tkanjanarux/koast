/* global require, console */

'use strict';

var express = require('express');
var mongoLoader = require('./mongo-loader');


var getAdminApiRouter = function(apiConfig, connection) {
  var apiRouter = express.Router();

  /*
  if(apiConfig.dataLoader && apiConfig.dataLoader.include) {
    var dlConfig = apiConfig.dataLoader || {};

    var dlRouter = express.Router();

    // TODO restrict permissions
    if(dlConfig.dump) {
      dlRouter.get('/dump', mongoLoader.getDumpCollectionHandler());
    }

    if(dlConfig.seed) {
      dlRouter.post('/seed', mongoLoader.getSeedCollectionHandler());
    }


    apiRouter.use('/dataloader', dlRouter);
  }
  */

  return apiRouter;
};

exports = module.exports = {

 /*
  * apiConfig is an object with the following keys that correspond to
  * each module, omitted fields will just not be loaded.
  *
  * - dataLoader (migration tool?)
  * - shutdownRestart
  * - kill
  * - database
  * - aws
  *
  * The corresponding values should look like this (you have to opt-in
  * always):
  *
  * dataLoader: {
  *   include: boolean,
  *   // more config options
  * }
  *
  * You must also pass in a database connection
  * TODO: support array of DB connections
  */
  getRouter: getAdminApiRouter
};
