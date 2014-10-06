/* jshint expr:true */
/* global require, describe, it, before, after */
'use strict';

var expect = require('chai').expect;
var config = require('./config');

describe('Test basic config loading.', function() {

  before(function() {

    config.setConfigDirectory(process.cwd() + '/test-data/unit-tests', {
      force: true
    });
  });

  it('Load local config', function(done) {
    config.loadConfiguration('local', {
      force: true
    }).then(function() {
      var fooConfig = config.getConfig('foo');
      expect(fooConfig).to.not.be.undefined;
      expect(fooConfig.foo).to.equal(42);
      expect(fooConfig.env).to.equal('local');
      done();
    }).fail(done);
  });

  it('Load staging config', function(done) {
    config.loadConfiguration('staging', {
      force: true
    }).then(function() {
      var fooConfig = config.getConfig('foo');
      expect(fooConfig).to.not.be.undefined;
      expect(fooConfig.env).to.equal('staging');
      done();
    }).fail(done);
  });

  it('Should contain common config bar and overwrite foo', function(
    done) {
    config.loadConfiguration('local', {
      force: true
    }).then(function() {
      var fooConfig = config.getConfig('foo');
      console.log(config.getConfig('testx'));
      expect(fooConfig).to.not.be.undefined;
      expect(fooConfig.foo).to.equal(42);
      expect(fooConfig.bar).to.equal(1337);
      expect(fooConfig.env).to.equal('local');
      done();
    }).fail(done);
  });
});