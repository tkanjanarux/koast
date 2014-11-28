/* jshint expr:true */
/* global require, describe, it, before, after, beforeEach, process */
'use strict';

var expect = require('chai').expect;
var config = require('../../../config');
var configInformation = require('../information');
var log = require('../../../log');
var fs = require('fs');
var _ = require('underscore');




describe('configuration information', function () {

  var APP_DEFAULT = process.cwd() +
    '/test-data/_configurationInfo/initial/app/config/app.json';
  var APP_ENVIRONMENT = process.cwd() +
    '/test-data/_configurationInfo/initial/app/config/configurationInfoTest.json';

  var BASE_DEFAULT = process.cwd() +
    '/test-data/_configurationInfo/initial/base/config/app.json';
  var BASE_ENVIRONMENT = process.cwd() +
    '/test-data/_configurationInfo/initial/base/config/configurationInfoTest.json';

  var debugInfo;


  before(function () {
    process.env.___RANDOM__TEST = 'test';
    config.setConfigDirectory(process.cwd() +
      '/test-data/_configurationInfo/initial/app', {
        force: true
      });
    return config.loadConfiguration('configurationInfoTest', {
      force: true,
      basedir: process.cwd() +
        '/test-data/_configurationInfo/initial/base/config'
    }).then(
      function (result) {

        debugInfo = configInformation(result._configurationInfo);
        return debugInfo;
      });
  });


  it('should identify app default settings as a source', function () {
    //  console.log(JSON.stringify(debugInfo, null, ' '));

    var s1k1 = _.find(debugInfo, function (i) {
      return i.path == 'section1.key1';
    });
    console.log(s1k1);
    expect(s1k1.resultValue).to.be.equal('app default');
    expect(s1k1.valueSource).to.be.equal('appDefault');
    expect(s1k1.valueConfig).to.be.equal(APP_DEFAULT);

  });

  it('should identify base default as a source', function () {

    var s1k2 = _.find(debugInfo, function (i) {
      return i.path == 'section1.key2';
    });

    expect(s1k2.resultValue).to.be.equal('base default');
    expect(s1k2.valueSource).to.be.equal('baseDefault');
    expect(s1k2.valueConfig).to.be.equal(BASE_DEFAULT);
  });

  it('should identify app environment as a source', function () {

    var s6k1 = _.find(debugInfo, function (i) {
      return i.path == 'section6.key1';
    });

    expect(s6k1.resultValue).to.be.equal('app env');
    expect(s6k1.valueSource).to.be.equal('appEnvironment');
    expect(s6k1.valueConfig).to.be.equal(APP_ENVIRONMENT);
  });

  it('should identify base environment as a source', function () {

    var s5k1 = _.find(debugInfo, function (i) {
      return i.path == 'section5.key1';
    });

    expect(s5k1.resultValue).to.be.equal('base env');
    expect(s5k1.valueSource).to.be.equal('baseEnvironment');
    expect(s5k1.valueConfig).to.be.equal(BASE_ENVIRONMENT);
  });

  it('should identiy app env as source if overwriting app default',
    function () {

      var s3k1 = _.find(debugInfo, function (i) {
        return i.path == 'section3.key1';
      });

      expect(s3k1.resultValue).to.be.equal('app env');
      expect(s3k1.valueSource).to.be.equal('appEnvironment');
      expect(s3k1.valueConfig).to.be.equal(APP_ENVIRONMENT);
    });

  it('should identify base env as source if overwriting base default',
    function () {

      var s5k1 = _.find(debugInfo, function (i) {
        return i.path == 'section5.key1';
      });

      expect(s5k1.resultValue).to.be.equal('base env');
      expect(s5k1.valueSource).to.be.equal('baseEnvironment');
      expect(s5k1.valueConfig).to.be.equal(BASE_ENVIRONMENT);
    });

});

describe('config info when working with arrays and numbers', function () {
  var configResult;
  var _configurationInfo;
  var app;
  var base;


  var debugInfo;


  before(function () {
    process.env.___RANDOM__TEST = 'test';
    config.setConfigDirectory(process.cwd() +
      '/test-data/_configurationInfo/nested/app', {
        force: true
      });
    return config.loadConfiguration('configurationInfoTest', {
      force: true,
      basedir: process.cwd() +
        '/test-data/_configurationInfo/nested/base/config'
    }).then(
      function (result) {
        configResult = result;
        _configurationInfo = configResult._configurationInfo;
        app = configResult._configurationInfo.app;
        base = configResult._configurationInfo.base;
        debugInfo = configInformation(_configurationInfo);
        return configResult;
      });
  });
  it('should handle a nested array', function () {

    _.forEach(debugInfo, function (i) {
      if (typeof i.valueSource === 'undefined') {
        //  console.log(i);
      }
    });
    expect(_.filter(debugInfo, function (i) {
      return typeof i.valueSource === 'undefined';
    }).length).to.be.equal(0);
  });
});

describe('config info when an env: is undefined', function () {
  var configResult;
  var _configurationInfo;
  var app;
  var base;


  var debugInfo;


  before(function () {
    process.env.___RANDOM__TEST = 'test';
    config.setConfigDirectory(process.cwd() +
      '/test-data/_configurationInfo/undefinedEnv/app', {
        force: true
      });
    return config.loadConfiguration('configurationInfoTest', {
      force: true,
      basedir: process.cwd() +
        '/test-data/_configurationInfo/undefinedEnv/base/config'
    }).then(
      function (result) {
        configResult = result;
        _configurationInfo = configResult._configurationInfo;
        app = configResult._configurationInfo.app;
        base = configResult._configurationInfo.base;
        debugInfo = configInformation(_configurationInfo);
        return configResult;
      });
  });
  it('should handle an env: protocol if env is not avail', function () {
    var missingValueSource =
      _.filter(debugInfo, function (i) {
        return i.valueSource == []._;
      });
    var missingValueConfig =
      _.filter(debugInfo, function (i) {
        return i.valueConfig == []._;
      });
    expect(missingValueSource.length).to.be.equal(0);
    expect(missingValueConfig.length).to.be.equal(0);
  });
});