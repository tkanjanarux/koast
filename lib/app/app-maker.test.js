/* jshint expr:true */
/* global require, describe, it, before, after */
'use strict';

var chai = require('chai');
var should = chai.should();
var _ = require('underscore');
var appMaker = require('./app-maker.js');

describe('app-maker starts', function() {

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
    var routers = [];
    var mountPromises = appMaker.configureRoutes(testRoutes, routers);
    _.map(mountPromises, function testRoutes(route) {
      route.then.should.be.a('function');
    });
    mountPromises.length.should.equal(testRoutes.length);
    done();
  });

});