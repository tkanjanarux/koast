/** @module lib/app/app-maker */
/* global require, exports, __dirname */

'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var Q = require('q');
var expect = require('chai').expect;
var _ = require('underscore');

var log = require('../log');
var authentication = require('../authentication/authentication');

var config = require('../config');

function assertSubrouteField(subroute, fieldName) {
  if (!subroute[fieldName]) {
    throw new Error('Error processing field ' + fieldName + ' in subroute.');
  }
}

function mountApiSubroute(app, routeConfig, module, subroute) {
  var path;
  var authFunction = subroute.authorization || module.defaults.authorization;
  var authorizationMiddleware;
  var handler = subroute.handler;
  var methods;


  assertSubrouteField(subroute, 'method');
  assertSubrouteField(subroute, 'route');
  assertSubrouteField(subroute, 'handler');

  path = routeConfig.route + '/' + subroute.route;

  log.verbose('    Subroute:', subroute.method, path);

  if (path.search('//') > 0) {
    log.warn('API endpoint path contains a double slash:', path);
  }

  // Figure out if we are mapping a single method or multiple methods.
  if (typeof subroute.method === 'string') {
    methods = [subroute.method];
  } else if (_.isArray(subroute.method)) {
    methods = subroute.method;
  } else {
    throw new Error(
      'Field "method" should be set either set either to a method name or an array of method names.'
    );
  }

  // Prepare the authorization middleware.
  authorizationMiddleware = function (req, res, next) {
    var authDecision = authFunction(req, res);
    if (authDecision !== true) {
      res.setHeader('Content-Type', 'application/json');
      res.send(401, {
        errorCode: 'not-authorized',
        displayMessage: 'Not authorized'
      });
    } else {
      next();
    }
  };

  // Now let's iterate over the different methods.
  methods.forEach(function (method) {
    // First, add an authorization middlware for this route.
    app[method](path, authorizationMiddleware);
    // Then add the actual handler. A handler is normally just a connect
    // middleware function. But it can alternatively be a function that
    // generates a middleware. If so, we'll need to get the actual handler by
    // calling it.
    if (subroute.handler.isMiddlewareFactory) {
      handler = subroute.handler({
        method: method
      });
    } else {
      handler = subroute.handler;
    }
    app[method](path, handler);
  });
}

function mountApiModule(app, routeConfig, module) {
  var modulePath = process.cwd() + '/' + routeConfig.module;
  log.verbose('    Module path:', modulePath);
  var mod = require(modulePath);
  mod.routes.forEach(function (subroute) {
    mountApiSubroute(app, routeConfig, mod, subroute);
  });
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
  console.log("App config is?", appConfig);
  var corsConfig = config.getConfig('cors');
  var app = express();
  var indexHtml;

  log.verbose('appConfig:', appConfig);

  // Use CORS if configured.
  if (corsConfig) {
    useCors(app, corsConfig);
  }

  console.log("appConfig?", appConfig);
  // Load index.html.
  if (appConfig.indexHtml) {
    indexHtml = fs.readFileSync(appConfig.indexHtml).toString();
  }

  // Use body parser.
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
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

  // Setting up top level routes
  if (appConfig.routes) {
    log.verbose('Adding routes:');
    appConfig.routes.forEach(function (routeConfig) {
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
        mountApiModule(app, routeConfig, routeConfig.module);
      }
    });
  } else {
    log.verbose('No routes to add.');
  }

  // Add authentication routes
  authentication.addAuthenticationRoutes(app);

  authentication.routes.forEach(function (route) {

    mountApiSubroute(app, {
      route: ''
    }, authentication, route);
  });

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
