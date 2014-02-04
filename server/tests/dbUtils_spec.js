/* global require, describe, it */
/* jshint expr:true */

'use strict';
var expect = require('chai').expect;
var config = require('../lib/config');
var dbUtils = require('../lib/database/dbUtils');

config.setConfigDirectory('test/config_data/');
config.setEnvironment('test');

var schemas = [{
  name: 'robots',
  properties: {
    robotNumber: {
      type: Number,
      required: true,
      unique: true
    },
    robotName: {
      type: String
    }
  }
}, {
  name: 'babyRobots',
  properties: {
    parentNumber: {
      type: Number,
      required: true
    },
    babyNumber: {
      type: Number,
      required: true
    }, // unique among siblings
    babyRobotName: {
      type: String
    }
  },
  indices: [
    [{
      parentNumber: 1,
      babyNumber: 1
    }, {
      unique: true
    }]
  ]
}];

describe('Create a connection.', function (done) {
  var connectionPromise;
  var connection;
  it('Create a connection', function (done) {
    connectionPromise = dbUtils.createConnection('foo', config.getConfig(
      'db'), schemas);
    connectionPromise.then(function (connection) {
      expect(connection).to.not.be.undefined;
      done();
    })
      .fail(function (connection) {
        throw 'This should not be called';
      });
  });
  it('Create a connection with a callback', function (done) {
    connectionPromise = dbUtils.createConnection('foo2',
      config.getConfig('db'),
      schemas,
      function (newConnection) {
        connection = newConnection;
        expect(connection).to.not.be.undefined;
        done();
      }
    );
  });
  it('Remove old robots', function (done) {
    connection.model('robots').remove({}, function (error, result) {
      expect(error).to.not.exist;
      done();
    });
  });
  it('Insert a robot', function (done) {
    connectionPromise
      .then(function (connection) {
        connection.model('robots').create({
          robotNumber: 1
        }, function (error, result) {
          expect(error).to.not.exist;
          done();
        });
      });
  });
  it('Insert the same robot again', function (done) {
    connectionPromise
      .then(function (connection) {
        connection.model('robots').create({
          robotNumber: 1
        }, function (error, result) {
          expect(error).to.exist;
          done();
        });
      });
  });
  it('Insert robot #2', function (done) {
    connectionPromise
      .then(function (connection) {
        connection.model('robots').create({
          robotNumber: 2
        }, function (error, result) {
          expect(error).to.not.exist;
          done();
        });
      });
  });
  it('Remove old baby robots', function (done) {
    connectionPromise
      .then(function (connection) {
        connection.model('babyRobots').remove({}, function (error, result) {
          expect(error).to.not.exist;
          done();
        });
      });
  });
  it('Insert baby robot 1 (son of 1)', function (done) {
    connectionPromise
      .then(function (connection) {
        connection.model('babyRobots').create({
          parentNumber: 1,
          babyNumber: 1
        }, function (error, result) {
          expect(error).to.not.exist;
          done();
        });
      });
  });
  it('Insert baby robot 2 (son of 1)', function (done) {
    connectionPromise
      .then(function (connection) {
        connection.model('babyRobots').create({
          parentNumber: 1,
          babyNumber: 2
        }, function (error, result) {
          expect(error).to.not.exist;
          done();
        });
      });
  });
  it('Insert baby robot 2 (son of 1) again', function (done) {
    connectionPromise
      .then(function (connection) {
        connection.model('babyRobots').create({
          parentNumber: 1,
          babyNumber: 2
        }, function (error, result) {
          expect(error).to.exist;
          done();
        });
      });
  });
});