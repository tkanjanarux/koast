/* global require, exports, __dirname */

'use strict';

var express = require('express');
var fs = require('fs');
var Q = require('q');
var expect = require('chai').expect;

var log = require('../log');
var authentication = require('../authentication/authentication');

var config = require('../config');

function assertSubrouteField (subroute, fieldName) {
  if (!subroute[fieldName]) {
    throw new Error('Error processing field ' + fieldName + ' in subroute.');
  }
}

function mountApiSubroute (app, routeConfig, module, subroute) {
  var path;
  var authFunction;
  assertSubrouteField(subroute, 'method');
  assertSubrouteField(subroute, 'route');
  assertSubrouteField(subroute, 'handler');

  path = routeConfig.route + '/' + subroute.route;

  authFunction = subroute.authorization || module.defaults.authorization;

  app[subroute.method](path, function (req, res, next) {  
    var authDecision = authFunction(req, res);
    if (authDecision!==true) {
      res.setHeader('Content-Type', 'application/json');
      res.send(401, {
        errorCode: 'failed-auth-no-token',
        displayMessage: 'Please provide a valid authentication token'
      });
    } else {
      next();      
    }
  });
  app[subroute.method](path, subroute.handler);
}

function mountApiModule(app, routeConfig, module) {
  var modulePath = process.cwd() + '/' + routeConfig.module;
  log.verbose('    Module path:', modulePath);
  var module = require(modulePath);
  module.routes.forEach(function(subroute) {
    mountApiSubroute(app, routeConfig, module, subroute);
  });
}

function useCors(app, corsConfig) {
  var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', corsConfig.origin);
    res.header('Access-Control-Allow-Headers', corsConfig.headers);
    res.header('Access-Control-Allow-Methods', corsConfig.methods);
    res.header('Access-Control-Allow-Credentials', corsConfig.credentials);
    next();
  };
  app.use(allowCrossDomain);
}

// Sets up an app based on a configuration file.
exports.makeExpressApp = function () {

  var appConfig = config.getConfig('app');
  var corsConfig = config.getConfig('cors');
  var app = express();
  var indexHtml;

  // Use CORS if configured.
  if (corsConfig) {
    useCors(app, corsConfig);
  }

  // Load index.html.
  if (appConfig.indexHtml) {
    indexHtml = fs.readFileSync(appConfig.indexHtml).toString();
  }

  // Use body parser.
  app.use(express.bodyParser());

  // Add handling of sessions.
  authentication.addSessionHandling(app);

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

  // Setting up top level routes
  if (appConfig.routes) {
    log.verbose('Adding routes.');
    appConfig.routes.forEach(function (routeConfig) {
      log.verbose('  Mounting %s route on %s.', routeConfig.type,
        routeConfig.route);
      if (routeConfig.type === 'static') {
        // Static is the easy case, let's handle it right here.
        app.use(routeConfig.route, express.static(routeConfig.path));
      } else if (routeConfig.type === 'module') {
        // An API module is more involved, so we call a function.
        mountApiModule(app, routeConfig, routeConfig.module);
      }
    });
  } else {
    log.verbose('No routes to add.');
  }

  // Add authentication routes
  authentication.addAuthenticationRoutes(app);

  // Handle errors.
  app.use(function (err, req, res, next) {
    log.error(err);
    log.error(err.stack);
    if (req) {
      res.send(500, {
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
      res.send(200, indexHtml);
    });
  }

  // 404 for everything else.
  app.get('*', function (req, res) {
    res.send(404, 'Not found.');
  });

  log.verbose('Resolving the app');
  return app;
};