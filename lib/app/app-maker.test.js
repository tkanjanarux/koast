/* jshint expr:true */
/* global require, describe, it, before, after */
'use strict';

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var _ = require('underscore');
var appMaker = require('./app-maker.js');

describe('app-maker starts', function() {
  var routers;
  before(function() {
    routers = [];
  });

  it('should configure routes properly', function(done) {
    var testRoutes = [
      {
        'route': '/api',
        'type': 'module',
        'module': 'test-data/modules/hello-world.js'
      },
      {
        'route': '/',
        'type': 'static',
        'path': 'client'
      }
    ];

    var mountPromises = appMaker.configureRoutes(testRoutes, routers);
    _.map(mountPromises, function testRoutes(route) {
      route.then.should.be.a('function');
    });
    mountPromises.length.should.equal(testRoutes.length);
    done();

  });

  it('should throw an error when not all properties are present', function(done) {
    var badRoute = [
      {
        'route': '/api',
        'type': 'module'
      }
    ];
    //You have to wrap the function that throws
    expect(function() {
      appMaker.configureRoutes(badRoute, routers);
    }).to.throw();
    done();
  });

  it('should throw a helpful error when a route property contains a spelling error', function(done) {
    var badRoute = [
      {
        'routes': '/api',
        'type': 'module',
        'module': 'test-data/modules/hello-world.js'  //Path not meant to exist.
      }
    ];
    expect(function() {
      appMaker.configureRoutes(badRoute, routers);
    }).to.throw();
    done();
  });

  it('should throw an error when type does not equal "module" or "static"', function(done) {
    var badRoute = [
      {
        'route': 'api',
        'type': 'unknown',
        'module': 'test-data/modules/hello-world.js'
      }
    ];
    expect(function() {
      appMaker.configureRoutes(badRoute, routers);
    }).to.throw();
    done();
  });

});