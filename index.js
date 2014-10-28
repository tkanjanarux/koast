/** @namespace koast */
/* global require */

'use strict';
var yarg = require('yargs');
var appMaker = require('./lib/app/app-maker');
var config = require('./lib/config');
var dbUtils = require('./lib/database/db-utils');
var logger = require('./lib/log');
var mongoMapper = require('./lib/mongo-mapper/mongo-mapper');
var mailer = require('./lib/mailer');
var pushNotifier = require('./lib/push-notifier/push-notifier');
var configCli = require('./lib/cli/config-cli');
var koast = exports;

// TODO refactor AWS code?!
var aws = require('./lib/aws/s3upload.js');
var argv = yarg.argv;



/**
 * koast router
 *
 * @var koastRouter
 * @memberof koast
 * @see module:koast/koast-router
 */
exports.koastRouter = require('./lib/koast-router');
exports.makeExpressApp = appMaker.makeExpressApp;

/**
 * Configuration module TODO
 *
 * @var config
 * @memberof koast
 * @see module:koast/config
 */
exports.config = config;
//exports.config.setEnvironment = config.setEnvironment;
//exports.config.setConfigDirectory = config.setConfigDirectory;
//exports.config.getConfig = config.getConfig;

/**
 * Database module TODO
 *
 * @var db
 * @memberof koast
 * @see module:koast/db
 */
exports.db = dbUtils;
//exports.db.createDatabaseConnections = dbUtils.createConfiguredConnections;*/
//exports.db.getDatabaseConnectionPromise = dbUtils.getConnectionPromise;
//exports.db.getDatabaseConnectionNow = dbUtils.getConnectionNow;
//exports.db.getConnectionHandles = dbUtils.getConnectionHandles;

/**
 * Mailer module TODO
 *
 * @var mailer
 * @memberof koast
 * @see module:koast/mailer
 */
exports.mailer = mailer;
//exports.mailer.makeMailer = mailer.mailerMaker;

/**
 * Mongo mapper module TODO
 *
 * @var mongoMapper
 * @memberof koast
 * @see module:koast/mongoMapper
 */
exports.mongoMapper = mongoMapper;
//exports.mapper.makeMongoMapper = mongoMapper.makeMapper;

/**
 * AWS utils TODO
 *
 * @var aws
 * @memberof koast
 * @see module:koast/aws
 */
exports.aws = aws;
//exports.aws.makeS3FileUploader = s3upload.makeS3FileUploader;

/**
 * Push notifications module
 *
 * @var pushNotifier
 * @memberof koast
 * @see module:koast/pushNotifier
 */
exports.pushNotifier = pushNotifier;

/**
 * Gets logger
 *
 * @function getLogger
 * @memberof koast
 */
exports.getLogger = function () {
  return logger;
};

/**
 * Configure a koast application
 * @memberof koast
 * @param {string} [env] - environment to use. If not specified, will use process.env.NODE_ENV, or default to development
 * @param {object} [options] - options to use for the application. If not specified, will load up config/app.json and environment specific settings.
 * @return {promise} promise that resolves once configuration is complete. Result of promise will contain the current configuration
 * @example
 * 'use strict';
 *
 * var koast = require('koast');
 * koast.configure()
 * .then(function (config) {
 *    console.log('This is your configuration: ', config);
 * });
 *
 * koast.serve();
 */
exports.configure = function (env, options) {

  if (env && !options && typeof env !== 'string') {
    options = env;
  }
  if (!env) {
    env = process.env.NODE_ENV || 'dev';
  }

  if (options) {
    return koast.config.loadConfiguration(env, options);
  } else {
    return koast.config.loadConfiguration();
  }
};
/**
 * Run the webserver.
 *
 * @function serve
 * @memberof koast
 */
exports.serve = function (options) {

  var log = koast.getLogger();

  return koast.config.whenReady
    .then(configCli)
    .then(koast.db.createConfiguredConnections)
    .then(function () {

      var appConfig = koast.config.getConfig('app');
      var portNumber = Number(process.env.PORT || appConfig.portNumber);
      var app = koast.makeExpressApp();
      app.listen(portNumber);
      log.info('Listening on ', portNumber);

      return app;
    })
    .then(null, function (error) {
      log.error('Error:', error);
      if (error.stack) {
        log.error(error.stack);
      }
    });
};