'use strict';
var expect = require('chai').expect;
var config = require('./config');

describe('Test basic config loading.', function() {

  before(function() {
    config.setConfigDirectory('server/test-data/unit-tests/config/', {force: true});
  });

  it('Load local config', function() {
    config.setEnvironment('local', {force: true});
    var fooConfig = config.getConfig('foo');
    expect(fooConfig).to.not.be.undefined;
    expect(fooConfig.foo).to.equal(42);
    expect(fooConfig.env).to.equal('local');
  });

  it('Load staging config', function() {
    config.setEnvironment('staging', {force: true});
    var fooConfig = config.getConfig('foo');
    expect(fooConfig).to.not.be.undefined;
    expect(fooConfig.env).to.equal('staging');
  });
});

