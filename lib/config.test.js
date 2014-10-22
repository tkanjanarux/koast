/* jshint expr:true */
/* global require, describe, it, before, after, beforeEach */
'use strict';

var expect = require('chai').expect;
var config = require('./config');

describe('Test basic config loading.', function () {

  beforeEach(function () {
    delete process.env.NODE_ENV;
  });

  before(function () {

    config.setConfigDirectory(process.cwd() + '/test-data/unit-tests', {
      force: true
    });
  });

  it('Load local config', function () {
    return config.loadConfiguration('local', {
      force: true
    }).then(function () {
      var fooConfig = config.getConfig('foo');
      expect(fooConfig).to.not.be.undefined;
      expect(fooConfig.foo).to.equal(42);
      expect(fooConfig.env).to.equal('local');
      return;
    });
  });

  it('Load staging config', function () {
    return config.loadConfiguration('staging', {
      force: true
    }).then(function () {
      var fooConfig = config.getConfig('foo');
      expect(fooConfig).to.not.be.undefined;
      expect(fooConfig.env).to.equal('staging');
      return;
    });
  });

  it('Should contain common config bar and overwrite foo', function () {
    return config.loadConfiguration('local', {
      force: true
    }).then(function () {
      var fooConfig = config.getConfig('foo');
      console.log(config.getConfig('testx'));
      expect(fooConfig).to.not.be.undefined;
      expect(fooConfig.foo).to.equal(42);
      expect(fooConfig.bar).to.equal(1337);
      expect(fooConfig.env).to.equal('local');
      return;
    });
  });
});
describe('Setting configuration explicitly', function () {
  beforeEach(function () {
    delete process.env.NODE_ENV;
  });
  it(
    'should override base koast settings with provided base configuration',
    function () {

      var options = {
        force: true,
        baseConfiguration: {
          app: {
            port: 2600
          }
        }

      };

      return config.loadConfiguration('randomTest', options).then(
        function (
          result) {
          expect(result.get('app').port).to.be.equal(2600);
          return;
        });
    });

  it('should override base koast settings app configuration if provided',
    function () {

      var options = {
        force: true,
        appConfiguration: {
          app: {
            port: 2600,
          }
        }

      };

      return config.loadConfiguration('randomTest', options).then(
        function (
          result) {
          expect(result.get('app').port).to.be.equal(2600);
          return;
        });
    });

  it('should merge base and app configuration if provided', function () {
    var options = {
      force: true,
      baseConfiguration: {
        app: {
          port: 2600
        },

      },
      appConfiguration: {
        app: {
          port: 2601,
          someKey: 'myValue'
        }
      }
    };
    return config.loadConfiguration('myEnv', options).then(function (
      result) {
      expect(result.get('app').port).to.be.equal(2601);
      expect(result.get('app').someKey).to.be.equal('myValue');
      return;
    });
  });

  it('should make use of shortstop resolvers', function () {
    process.env.TEST_PORT = 2601;
    var options = {
      force: true,
      appConfiguration: {
        app: {
          port: 'env:TEST_PORT|d',

        }
      }
    };
    return config.loadConfiguration('myEnv', options).then(function (
      result) {
      expect(result.get('app').port).to.be.equal(2601);
      return;
    });
  });

  it('should default env to dev if none is specified', function () {
    return config.loadConfiguration(undefined, {
      force: true
    }).then(function (
      result) {
      expect(process.env.NODE_ENV).to.be.equal('dev');
      return;
    });
  });

  it('should set the NODE_ENV to what I specify', function () {
    return config.loadConfiguration('myTest', {
      force: true
    }).then(function (
      result) {
      expect(process.env.NODE_ENV).to.be.equal('myTest');
      return;
    });
  });
});
