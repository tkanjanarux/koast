/**
 * @module lib/config-inspector/information
 */

var steeltoe = require('steeltoe');
var _ = require('underscore');
var traverse = require('traverse');

function getValueObject(key, info) {


  var get = function (path) {
    return info.get(path.split('.').concat(key));
  };


  var result = {
    path: key.join('.'),
    resultValue: info.get(['result'].concat(key)),

    base: {
      default: {
        preProcessed: get('base.default.preProcessed'),
        postProcessed: get('base.default.postProcessed')
      },
      environment: {
        preProcessed: get('base.environment.preProcessed'),
        postProcessed: get('base.environment.postProcessed')
      }
    },
    app: {
      default: {
        preProcessed: get('app.default.preProcessed'),
        postProcessed: get('app.default.postProcessed')
      },
      environment: {
        preProcessed: get('app.environment.preProcessed'),
        postProcessed: get('app.environment.postProcessed')
      }
    },
    baseDefaultValue: get('base.default.postProcessed'),
    baseEnvironmentValue: get('base.environment.postProcessed'),
    appDefaultValue: get('app.default.postProcessed'),
    appEnvironmentValue: get('app.environment.postProcessed')

  };


  return result;
}

function determineValueSource(configurationInfo, item) {
  if (typeof item.appEnvironmentValue !== 'undefined' && item.appEnvironmentValue !==
    item.appDefaultValue) {
    item.valueSource = 'appEnvironment';
    item.valueConfig = configurationInfo.app.environmentSource;
  } else if (typeof item.appDefaultValue !== 'undefined') {
    item.valueSource = 'appDefault';
    item.valueConfig = configurationInfo.app.defaultSource;
  } else if (typeof item.baseEnvironmentValue !== 'undefined' && item.baseEnvironmentValue !==
    item.baseDefaultValue) {
    item.valueSource = 'baseEnvironment';
    item.valueConfig = configurationInfo.base.environmentSource;
  } else if (typeof item.baseDefaultValue !== 'undefined') {
    item.valueSource = 'baseDefault';
    item.valueConfig = configurationInfo.base.defaultSource;
  }
  return item;
}


/**
 * Generats a summary of the configuration object
 * @param  {object} configurationInfo - a koast configuration object
 * @return {string}                   - configuration details
 */
module.exports = exports = function (configurationInfo) {
  var paths = traverse(configurationInfo.result).paths();

  return _.chain(paths)
    .map(function (key) {
      return getValueObject(key, traverse(configurationInfo));
    }).map(function (item) {
      return determineValueSource(configurationInfo, item);
    }).value();
};
