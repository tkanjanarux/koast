/* global require, describe, it, console */

'use strict';

var expect = require('chai').expect;

var koast = require('../index');
koast.setConfigDirectory('test/index_config/');
koast.setEnvironment('test');

describe('Basic app setup.', function () {
  var appConfig = koast.getConfig('app');
  var dbConfig = koast.getConfig('database');
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

  it('Initialize a db connection.', function(done) {
    koast.createNamedDatabaseConnection('maindb', dbConfig, schemas)
      .then(function (connection) {
        console.log('Resolved the connection');
        expect(connection).to.not.be.undefined;
        console.log('Good');
        done();
      });
  });

  it('Make an app', function() {
    var app = koast.makeExpressApp(appConfig);
    expect(app).to.not.be.undefined;
  });

});