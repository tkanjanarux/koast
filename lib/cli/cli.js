/* global require, console */

'use strict';

var q = require('q');
var yargs = require('yargs');
var _ = require('underscore');
var fs = require('fs');

var config = require('../config');
var dbUtils = require('koast-db-utils');
var versionReporter = require('../version-reporter');
var seed = require('./seed');

var usage = 'Usage: $0 --env [env] <command>';

var connection;
var configInspector = require('../config-inspector');
var configCli = require('./config-cli');
var log = require('../log');





function getArgs(command, subCommand) {

  var dbCommands = ['load', 'drop', 'reload', 'dump'];
  var info;

  if (command === 'help') {
    command = subCommand;

  };

  if (dbCommands.indexOf(command) >= 0) {
    info = yargs
      .usage(usage)
      .default('env', 'dev')
      .describe('env', 'The environment to run in.')
      .describe('col', 'Mongo collection to use.')
      .describe('db', 'The database to use.')
      .describe('config', 'Config directory to use.')
      .describe('src', 'The source file.')
  } else {
    info = yargs;
  }

  return info;
}

var args = getArgs(yargs.argv._[0], yargs.argv._[1]);
var argv = yargs.argv;

var handlers = {};

var loadedConfig;

handlers.help = ['Provides help.',
  function () {
    var helpCmd = yargs.argv._[1];
    if (helpCmd) {
      var helpHandler = handlers[helpCmd][2] || args.showHelp;
      helpHandler();
    } else {
      console.log('Available commands:');
      _.keys(handlers).forEach(function (key) {
        console.log('   %s:\t%s', key, handlers[key][0]);
      });
    }
  },
  args.showHelp
];

function demand(keys) {
  if (typeof keys === 'string') {
    keys = [keys];
  }
  args.demand(keys).argv;

}

function getConnection() {

  if (connection) {
    return q.when(connection);
  } else {
    return dbUtils.createConfiguredConnections(null, null, config, log)
      .then(function () {

        var handles = dbUtils.getConnectionHandles();
        if (handles.length > 1) {
          demand('db');
        }
        connection = dbUtils.getConnectionNow(argv.db || handles[0]);
        return connection;
      }).then(null, function (err) {
        console.log('err', err);
        return err;
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
    args.demand(['src', 'col']).argv;
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
    args.demand(['col']).argv;
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
    args.demand(['src', 'col']).argv;
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
  if (argv._[0] !== 'help')
    require('child_process').exec('npm start').unref();
}, function () {
  console.log(handlers['start'][0])
}];

handlers.init = ['Seeds Koast application from template',
  function () {
    if (argv._[0] !== 'help')
      seed.seed();
  },
  function () {
    console.log(handlers['init'][0])
  }
];


handlers.configInfo = ['Displays Configuration Info', function (
  configOptions) {

  try {
    configCli(configOptions);
  } catch (e) {
    console.log(e);
  }



}, configCli.help];

function dispatch(configOptions) {
  var command = argv._[0];
  var subCommand = argv._[1];
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