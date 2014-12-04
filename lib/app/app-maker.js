/** @module lib/app/app-maker */
/* global require, exports, __dirname */

'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var Q = require('q');
var expect = require('chai').expect;
var _ = require('underscore');
var multer = require('multer');
var q = require('q');

var log = require('../log');
var authentication = require('../authentication/authentication');
var config = require('../config');
var koastRouter = require('koast-router');
var versionReporter = require('../version-reporter');

// Returns a promise when module is finished mounting
// 
function mountApiModule(app, routeConfig, module) {
  var modulePath = process.cwd() + '/' + routeConfig.module;
  log.verbose('    Module path:', modulePath);
  var mod = require(modulePath);
  if (mod.routes) {
    log.warn(
      'export.routes will become deprecated. Please see documentation for more information.'
    );
    app.use(routeConfig.route, koastRouter(mod.routes, mod.defaults, null, log));
  } else if (mod.koastModule && mod.koastModule.router) {
    log.info('koastModule found: mounting router');

    var router = mod.koastModule.router;
    if(router.then && typeof(router.then) === 'function') {
      
      return router.then(function(r) {
        console.log('PROMISED ROUTER', r.stack);

        debugger;

        app.use(routeConfig.route, function(req, res) {
          res.send('raf wuz here');
        });

        debugger;
      }, log.error);

    } else {
      console.log('SYNC ROUTER', router.stack);
      app.use(routeConfig.route, router);
    }
    
  } else {
    throw 'No routes found in ' + routeConfig.module;
  }

  return q.when();
}


function useCors(app, corsConfig) {
  var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', corsConfig.origin);
    res.header('Access-Control-Allow-Headers', corsConfig.headers);
    res.header('Access-Control-Allow-Methods', corsConfig.methods);
    res.header('Access-Control-Allow-Credentials', corsConfig.credentials);
    next();
  };
  app.use(allowCrossDomain);
}

/**
 * Sets up an app based on a configuration file.
 * @param {string} [newRole] The new role of the employee.
 */
exports.makeExpressApp = function () {

  var appConfig = config.getConfig('app');
  var corsConfig = config.getConfig('cors');
  var authConfig = config.getConfig('authentication');
  var app = express();
  app.disable('x-powered-by');
  var indexHtml;

  app.use(versionReporter.getMiddleware());

  // Use CORS if configured.
  if (corsConfig) {
    useCors(app, corsConfig);
  }

  // Load index.html.
  if (appConfig.indexHtml) {
    indexHtml = fs.readFileSync(appConfig.indexHtml).toString();
  }

  // Use body parser.
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));


  // multipart file support
  app.use(multer());

  // Add handling of sessions


  authentication.addAuthMaintenance(app);


  // Enable LESS.
  if (appConfig.lessPaths) {
    var lessMiddleware = require('less-middleware');
    appConfig.lessPaths.forEach(function (pathConfig) {
      // pathConfig should be an array [<mountMount>, <path>].
      log.verbose('Enabling LESS conversion for %s mounted at %s.',
        pathConfig[1], pathConfig[0]);
      app.use(pathConfig[0], lessMiddleware({
        src: pathConfig[1]
      }));
    });
  }

  // when all of these promises resolve we can use the app
  var mountPromises;

  // Setting up top level routes
  if (appConfig.routes) {
    log.verbose('Adding routes:');

     mountPromises = _.map(appConfig.routes, function (routeConfig) {
      log.verbose('  Mounting %s route on %s.', routeConfig.type,
        routeConfig.route);

      if (routeConfig.route[0] !== '/') {
        log.warn('Route path does not start with a slash:', routeConfig.route);
      }

      if (routeConfig.type === 'static') {
        // Static is the easy case, let's handle it right here.
        app.use(routeConfig.route, express.static(routeConfig.path));
      } else if (routeConfig.type === 'module') {
        // An API module is more involved, so we call a function.
        return mountApiModule(app, routeConfig, routeConfig.module);
      }

      return q.when();
    });


    debugger;

  } else {
    log.verbose('No routes to add.');
  }

  /*
  // add auth routes
  if (authConfig && (authConfig.strategy === 'password' || authConfig.strategy ===
      'social')) {
    authentication.addAuthenticationRoutes(app);
    app.use('/', koastRouter(authentication.routes, authentication
      .defaults, null, log));
  } else if (authConfig && authConfig.strategy === 'disabled') {
    log.info('Authentication strategy set to disabled, no auth.');
  } else {
    log.warn('Authentication was not configured, will not be enabled.');
  }


  // Handle errors.
  app.use(function (err, req, res, next) {
    log.error(err);
    log.error(err.stack);
    if (req) {
      res.status(500).send({
        error: 'Something blew up!'
      });
    } else {
      next(err);
    }
  });

  // Setup the routes
  log.verbose('Set up some routes');

  // First the index file.
  if (indexHtml) {
    app.get('/', function (req, res) {
      res.status(200).send(indexHtml);
    });
  }

  app.use(require('../meta-provider')());
  */

  // 404 for everything else.
  app.get('*', function (req, res) {
    res.status(404).send('Not found.');
  });

  log.verbose('Resolving the app');

  return q.all(mountPromises).then(function() {
    console.log('REturning app from promise');
    console.log(app._router.stack);
    debugger;
    return app;
  }, log.error);
};
