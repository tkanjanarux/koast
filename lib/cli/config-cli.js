/* use strict */
var configInspector = require('../config-inspector');
var argv = require('yargs').argv;

module.exports = exports = function (configOptions) {
  var debugInfo = configInspector.getConfigurationInformation(configOptions
    ._configurationInfo);

  if (!argv.mode || argv.mode === 'summary') {
    var summary = configInspector.getConfigurationSummary(debugInfo, {
      format: argv.format,
      display: argv.display,
      include: (argv.include) ? argv.include.split(',') : []._
    });
    if (summary.format === 'table') {
      console.log(summary.toString());
    } else if (summary.format === 'raw') {
      console.log(JSON.stringify(summary, null, ' '));
    }
  } else if (argv.mode === 'debug') {
    console.log(JSON.stringify(configOptions._configurationInfo, null, ' '));
  }

};