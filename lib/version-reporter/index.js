/** @module koast/versionReporter */
'use strict';

var localVersion = require('../../package.json').version;
var globalVersion =
  require(process.env['NODE_PATH'] + '/koast/package.json').version;
var log = require('../log');

/**
 * Create a middleware to add koast version headers to the response
 * @return {function}
 */
var getMiddleware = function()
{
  return function(req,res,next)
  {
        res.header('X-Powered-By', 'Koast');
        res.header('X-Koast-Version', localVersion);
        next();
  };
};

var globalVersionWarning = function() {
  if(localVersion && localVersion !== globalVersion) {
    log.warn('Local koast [' + localVersion +
        '] does not match global [' + globalVersion + ']')
  }
};

module.exports = exports = {
  getMiddleware: getMiddleware,
  localVersion: localVersion,
  globalVersion: globalVersion,
  globalVersionWarning: globalVersionWarning
};
