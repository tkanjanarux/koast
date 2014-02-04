/* global require, exports */

'use strict';

var mongoose = require('mongoose');
var format = require('util').format;
var async = require('async');
var _ = require('underscore');
var Q = require('q');

// mongoose.set('debug', true);

function makeMongoUrl(dbConfig) {
  return format('mongodb://%s:%d/%s', dbConfig.host, dbConfig.port, dbConfig.db);
}

var connectionPromises = {};
var unnamedConnectionPromise;

function createConnection(dbConfig, schemas, callback) {

  var deferred = Q.defer();
  var connection = mongoose.createConnection(makeMongoUrl(dbConfig), function (
    error) {
    if (error) {
      deferred.reject(error);
      return deferred.promise;
    }
  });

  connection.on('error', function (error) {
    deferred.reject(error);
  });

  var schemaTasks = _.map(schemas, function (schema) {
    return function (callback) {
      var mongooseSchema = new mongoose.Schema(schema.properties, {
        collection: schema.name
      });
      var model;
      (schema.indices || []).forEach(function (index) {
        mongooseSchema.index(index[0], index[1]);
      });
      model = connection.model(schema.name, mongooseSchema);
      // model.on('index', function (err) {
      //   if (err) {
      //     // Do something about error during index creation
      //   }
      // });
      model.ensureIndexes(function (error) {
        if (error) {
          callback(error);
        } else {
          callback();
        }
      });
    };
  });

  async.series(schemaTasks, function (error) {
    if (error) {
      deferred.reject(error);
    } else {
      if (callback) {
        callback(connection);
      }
      deferred.resolve(connection);
    }
  });

  return deferred.promise;
};

exports.createConnection = function (dbConfig, schemas, callback) {
  unnamedConnectionPromise = createConnection(dbConfig, schemas, callback);
  return unnamedConnectionPromise;
}

exports.createNamedConnection = function (name, dbConfig, schemas, callback) { 
  var connectionPromise = createConnection(dbConfig, schemas, callback);
  connectionPromises[name] = connectionPromise;
  return connectionPromise;
}

exports.getConnection = function (name) {

  var promise;

  if (name) {
    promise = connectionPromises[name];
  } else {
    promise = unnamedConnectionPromise;
  }

  if (promise) {
    return promise;
  } else {
    throw 'No such connection.';
  }
};