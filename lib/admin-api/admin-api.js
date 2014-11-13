/* global require, console */

'use strict';

var express = require('express');


var getAdminApiRouter = function(apiConfig, connection) {
  var apiRouter = express.Router();

  return apiRouter;
};

// TODO configure with backup
exports = module.exports = {
   getRouter: getAdminApiRouter
};
