/* jshint expr:true */
/* global require, describe, it, before, after, beforeEach, process */
'use strict';

var expect = require('chai').expect;
var config = require('./config');
var log = require('./log');
var fs = require('fs');

function readJsonFromFile(fullPath) {
  if (fs.existsSync(fullPath)) {
    return JSON.parse(fs.readFileSync(fullPath));
  }
}

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

describe('configuration info by setConfiguration', function () {
  var configResult;
  var app;
  var base;
  before(function () {
    process.env.___RANDOM__TEST = 'test';

    return config.loadConfiguration('myTest', {
      force: true,
      baseConfiguration: {
        section1: {
          key2: 'value 2'
        },
        section2: {
          key1: 'value1-1'
        },
        section4: {
          key1: 'env:___RANDOM__TEST'
        }
      },
      appConfiguration: {
        section1: {
          key1: 'value 1'
        },
        section2: {
          key1: 'value 1'
        },
        section3: {
          key1: 'value 1',
          key2: 'env:___RANDOM__TEST'
        }
      }
    }).then(function (result) {
      configResult = result;
      app = configResult._configurationInfo.app;
      base = configResult._configurationInfo.base;
      return configResult;
    });
  });

  it('should have a _configurationInfo object', function () {
    expect(configResult._configurationInfo).to.not.be.undefined;
  });

  it('should have base default source marked as n/a', function () {
    expect(base.defaultSource).to.be.equal('n/a');
  });

  it('should have app default source marked as n/a', function () {
    expect(app.defaultSource).to.be.equal('n/a');
  });

  it('should have the base source marked as provided', function () {

    expect(base.environmentSource).to.be.equal('provided');
  });

  it('should have the app source marked as provided', function () {

    expect(app.environmentSource).to.be.equal('provided');
  });

  it('should have the pre-processed app config available', function () {

    expect(app.environment.preProcessed.section3.key2).to.be.equal(
      'env:___RANDOM__TEST');
  });

  it('should have the post-processed app config available', function () {
    expect(app.environment.postProcessed.section3.key2).to.be.equal(
      'test');
  });

  it('should have the pre-processed base config available', function () {

    expect(base.environment.preProcessed.section4.key1).to.be.equal(
      'env:___RANDOM__TEST');
  });

  it('should have the post-processed base config available', function () {

    expect(base.environment.postProcessed.section4.key1).to.be.equal(
      'test');
  });

  it('should have the resulting config', function () {
    var result = configResult._configurationInfo.result;
    var expectedResut = {
      section1: {
        key1: 'value 1',
        key2: 'value 2',
      },
      section2: {
        key1: 'value 1'
      },
      section3: {
        key1: 'value 1',
        key2: 'test',
      },
      section4: {
        key1: 'test'
      }
    };
    expect(result.section1.key1).to.be.equal(expectedResut.section1.key1);
    expect(result.section1.key2).to.be.equal(expectedResut.section1.key2);
    expect(result.section2.key1).to.be.equal(expectedResut.section2.key1);
    expect(result.section3.key1).to.be.equal(expectedResut.section3.key1);
    expect(result.section3.key2).to.be.equal(expectedResut.section3.key2);
    expect(result.section4.key1).to.be.equal(expectedResut.section4.key1);
  });


});

describe('configuration info by loadConfiguration', function () {
  var configResult;
  var _configurationInfo;
  var app;
  var base;

  var baseDefault = readJsonFromFile(process.cwd() +
    '/test-data/_configurationInfo/initial/base/config/app.json');
  var baseEnvironment = readJsonFromFile(process.cwd() +
    '/test-data/_configurationInfo/initial/base/config/configurationInfoTest.json'
  );

  var appDefault = readJsonFromFile(process.cwd() +
    '/test-data/_configurationInfo/initial/app/config/app.json');
  var appEnvironment = readJsonFromFile(process.cwd() +
    '/test-data/_configurationInfo/initial/app/config/configurationInfoTest.json'
  );


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
        configResult = result;
        _configurationInfo = configResult._configurationInfo;
        app = configResult._configurationInfo.app;
        base = configResult._configurationInfo.base;
        return configResult;
      });
  });


  describe('configuration loading', function () {


    it('should have a _configurationInfo object', function () {
      expect(configResult._configurationInfo).to.not.be.undefined;
    });

    // tests for base - default


    it('should set the base defaultSource path for the base config',
      function () {
        expect(base.defaultSource).to.be.equal(process.cwd() +
          '/test-data/_configurationInfo/initial/base/config/app.json');
      });

    it('should contain the default pre processed base config', function () {
      expect(base.default.preProcessed).to.not.be.undefined;
      expect(base.default.preProcessed).to.not.be.empty;
      expect(base.default.preProcessed.section1.key2).to.be.equal('base default');
    });

    it('should contain preProcessed base defaults', function () {
      expect(base.default.preProcessed).to.be.eql(baseDefault);
      expect(base.default.preProcessed.section4.key1)
        .to.be.equal('env:___RANDOM__TEST');
    });

    it('should contain postProcess base defaults', function () {

      expect(base.default.postProcessed.section4.key1)
        .to.be.equal('test');
      expect(base.default.postProcessed.section3).to.be.undefined;
      expect(base.default.postProcessed.section5).to.be.undefined;
    });

    // tests for base - environment

    it('should set the environmentSource for base config', function () {
      expect(base.environmentSource).to.be.equal(process.cwd() +
        '/test-data/_configurationInfo/initial/base/config/configurationInfoTest.json'
      );
    });

    it('should set the environmentSource for app config', function () {
      expect(app.environmentSource).to.be.equal(process.cwd() +
        '/test-data/_configurationInfo/initial/app/config/configurationInfoTest.json'
      );
    });

    it('should contain the base.environmentPreProcessed config',
      function () {

        expect(base.environment.preProcessed).to.not.be.undefined;
        expect(base.environment.preProcessed).to.not.be.empty;
        expect(base.environment.preProcessed).to.be.eql(
          baseEnvironment);
        expect(base.environment.preProcessed.section5.key2)
          .to.be.equal('env:___RANDOM__TEST');
      });

    it('should contain the base.environmentPostProcessed config',
      function () {
        expect(base.environment.postProcessed).to.not.be.undefined;
        expect(base.environment.postProcessed).to.not.be.empty;

        expect(base.environment.postProcessed.section5.key1).to.be.equal(
          'base env');
        expect(base.environment.postProcessed.section5.key2).to.be.equal(
          'test');
      });



    // tests for app - default

    it('should set the app defaultSource path for the app config',
      function () {
        expect(app.defaultSource).to.be.equal(process.cwd() +
          '/test-data/_configurationInfo/initial/app/config/app.json');
      });

    it('should contain the default pre processed app config', function () {
      expect(app.default.preProcessed).to.not.be.undefined;
      expect(app.default.preProcessed).to.not.be.empty;
      expect(app.default.preProcessed).to.be.eql(appDefault);
      expect(app.default.preProcessed.section3.key2)
        .to.be.equal('env:___RANDOM__TEST');
    });


    it('should contain the default post processed app config', function () {

      expect(app.default.postProcessed).to.not.be.undefined;
      expect(app.default.postProcessed).to.not.be.empty;
      expect(app.default.postProcessed.section3.key2)
        .to.be.equal('test');
    });

    // tests for app - environemnt

    it('should contain the environment pre processed app config',
      function () {

        expect(app.environment.preProcessed).to.not.be.undefined;
        expect(app.environment.preProcessed).to.not.be.empty;

      });

    it('should contain the environment post processed app config',
      function () {
        expect(app.environment.postProcessed).to.not.be.undefined;
        expect(app.environment.postProcessed).to.not.be.empty;
        expect(app.environment.postProcessed.section6.key2)
          .to.be.equal('test');
      });

    it('should contain unprocessed app environment', function () {

      expect(app.environment.preProcessed).to.be.eql(appEnvironment);
      expect(app.environment.preProcessed.section6.key2)
        .to.be.equal('env:___RANDOM__TEST');
    });

  });


});
