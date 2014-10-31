var expect = require('chai').expect;
var config = require('../config');
var log = require('../log');
var fs = require('fs');
var _ = require('underscore');
var path = require('path');
var exec = require('child_process').exec;
var format = require('util').format;

var KOAST = path.resolve(__dirname, '../../bin/koast');
var CONFIG_DIRECTORY = process.cwd() + '/test-data/_configurationInfo/app'
describe('cli debug display', function () {

  it('should display configuration as a table if no other options', function (done) {
    exec(format('%s %s --env _configurationInfo --config %s', KOAST, 'configInfo',CONFIG_DIRECTORY), function (err, stdout, stderr) {
      if (err) {
        done(err);
      } else {
        expect(stdout.indexOf('┌────────────────────┬─')).to.be.greaterThan(1);
        done();
      }
    });
  });
});
