'use strict';
var expect = require('chai').expect;
var config = require('../lib/config');

config.setConfigDirectory('test/config_data/');


describe('Test basic config loading.', function() {
  it('Load local config', function() {
    config.setEnvironment('local');
    var fooConfig = config.getConfig('foo');
    expect(fooConfig).to.not.be.undefined;
    expect(fooConfig.foo).to.equal(42);
    expect(fooConfig.env).to.equal('local');
  });

  it('Load staging config', function() {
    config.setEnvironment('staging');
    var fooConfig = config.getConfig('foo');
    expect(fooConfig).to.not.be.undefined;
    expect(fooConfig.env).to.equal('staging');
  });
});

