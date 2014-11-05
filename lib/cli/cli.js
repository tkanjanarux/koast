/* global require, console */

'use strict';

var q = require('q');
var yargs = require('yargs');
var _ = require('underscore');
var fs = require('fs');

var config = require('../config');
var dbUtils = require('../database/db-utils');
var versionReporter = require('../version-reporter');
var seed = require('./seed');

var usage = 'Usage: $0 --env [env] <command>';

var connection;
var configInspector = require('../config-inspector');
var configCli = require('./config-cli');




var y = yargs
  .usage(usage)
  .default('env', 'dev')
  .describe('env', 'The environment to run in.')
  .describe('col', 'Mongo collection to use.')
  .describe('db', 'The database to use.')
  .describe('config', 'Config directory to use.')
  .describe('src', 'The source file.')
  .demand([0]);

var argv = y.argv;

var handlers = {};

var loadedConfig;
handlers.help = ['Provides help.',
  function () {
    console.log('Available commands:');
    _.keys(handlers).forEach(function (key) {
      console.log('   %s:\t%s', key, handlers[key][0]);
    });
  }
];

function demand(keys) {
  if (typeof keys === 'string') {
    keys = [keys];
  }
  keys.forEach(function (key) {
    if (!argv[key]) {
      console.log('Please specify option "%s".', key);
      process.exit();
    }
  });
}

function getConnection() {
  if (connection) {
    return q.when(connection);
  } else {
    return dbUtils.createConfiguredConnections()
      .then(function () {
        var handles = dbUtils.getConnectionHandles();
        if (handles.length > 1) {
          demand('db');
        }
        connection = dbUtils.getConnectionNow(argv.db || handles[0]);
        return connection;
      });
  }
}

function getModel() {
  return getConnection()
    .then(function (connection) {
      var model;
      demand('col');
      return connection.model(argv.col);
    })
    .fail(function (error) {
      console.error(error);
      process.exit();
    });
}

function exitOnError(error) {
  if (error) {
    console.error(error);
    process.exit();
  }
}

function loadData() {
  var deferred = q.defer();
  return getModel()
    .then(function (model) {
      var data;
      demand('src');
      data = JSON.parse(fs.readFileSync(argv.src).toString());
      model.create(data, function (error, result) {
        exitOnError(error);
        // Now check what we have in the database.
        model.find({}, function (error, result) {
          exitOnError(error);
          deferred.resolve(result.length);
        });
      });
      return deferred.promise;
    });
}

handlers.load = ['Loads data into the database.',
  function () {
    loadData()
      .then(function (numberOfItems) {
        console.log('Loaded data. We now have %d items in %s.',
          numberOfItems,
          argv.col);
        process.exit();
      })
      .fail(exitOnError);
  }
];

function dropCollection() {
  var deferred = q.defer();
  return getModel()
    .then(function (model) {
      model.remove({}, function (error, result) {
        exitOnError(error);
        // Now check what we have in the database.
        model.find({}, function (error, result) {
          exitOnError(error);
          deferred.resolve(result.length);
        });
      });
      return deferred.promise;
    });
}

handlers.drop = ['Drops all data from a mongo collection.',
  function () {
    dropCollection()
      .then(function (numberOfItems) {
        console.log('We now have %d items in %s.', numberOfItems, argv.col);
        process.exit();
      })
      .fail(exitOnError);
  }
];

handlers.reload = [
  'Drops all data from a mongo collection and reloads from a file',
  function () {
    dropCollection()
      .then(function () {
        return loadData();
      })
      .then(function (numberOfItems) {
        console.log('Reloaded data. We now have %d items in %s.',
          numberOfItems,
          argv.col);
        process.exit();
      })
      .fail(exitOnError);
  }
];

handlers.dump = ['Dumps all data from a mongo collection to stdio.',
  function () {
    getModel()
      .then(function (model) {
        model.find({}, function (error, result) {
          exitOnError(error);
          // Now check what we have in the database.
          console.log(JSON.stringify(result, null, 2));
          process.exit();
        });
      })
      .fail(exitOnError);
  }
];

handlers.start = ['Launches a koast application', function () {
  require('child_process').exec('npm start').unref();
}];

handlers.init = ['Seeds Koast application from template',
  function () {
    seed.seed();
  }
];


handlers.configInfo = ['Displays Configuration Info', function (configOptions) {

  try {
    configCli(configOptions);
  } catch (e) {
    console.log(e);
  }



}];

function dispatch(configOptions) {
  var command = argv._[0];
  var handler = handlers[command] || handlers.help;
  var func = handler[1];
  func(configOptions);
}


if (argv.config) {
  config.setConfigDirectory(argv.config);
}

config.loadConfiguration(argv.env, {
  force: true
}).then(function (configOptions) {
  versionReporter.globalVersionWarning();
  dispatch(configOptions);
});
