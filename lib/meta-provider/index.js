'use strict';

var expressRouter = require('express').Router;
var log = require('../log');
var semver = require('semver');


module.exports = exports = function (options) {
  options = options || {};
  options.version = options.version || require('../../package.json').version;

  var router = expressRouter();
  router.use('/meta/koast-angular/check-compatability', function (req, res,
    next) {
    var versionCheck = req.query['koast-version'];
    var result;
    if (!versionCheck) {
      res.status(400).send({
        errors: {
          'koast-version': {
            message: 'koast-version is required in query string'
          }
        }
      });
    } else {
      result = semver.satisfies(options.version, versionCheck);
      log.debug(
        'Checking koast compatability. Current koast version: %s, compatability check: %s, result %s',
        options.version, versionCheck, result);
      res.status(200).send({
        isCompatible: result,
        koastVersion: options.version,
        checkedVersion: versionCheck
      });
    }

  });
  return router;

};