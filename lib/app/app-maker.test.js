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
        'module': 'server/api'
      },
      {
        'route': '/',
        'type': 'static',
        'path': 'client'
      }
    ];
    var mountPromises = appMaker.configureRoutes(testRoutes);
    _.map(mountPromises, function testRoutes(route) {
      route.then.should.defined();
    });
    mountPromises.length.should.equal(testRoutes.length);
    done();
  });

});