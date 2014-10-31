/* jshint expr:true */
/* global require, describe, it, before, after, beforeEach, process, xit */
'use strict';

var expect = require('chai').expect;
var config = require('../../../config');
var configSummary = require('../summary');
var log = require('../../../log');
var fs = require('fs');
var _ = require('underscore');
var debugInfo = require('../testing/fixtures').debugInfo;


describe('configuration summary', function () {

  describe('with default options', function () {

    var summary;

    before(function () {
      summary = configSummary(debugInfo);
    });

    it('should default to table layout', function () {
      expect(summary.format).to.be.equal('table');
    });

    it('should use the default headers', function () {
      expect(summary.options.head).to.eql(['path', 'value',
        'source'
      ]);
    });

    it('should display the post-processed values', function () {

      var item = _.find(summary, function (i) {
        return i.path === 'section3.key2';
      });

      console.log(item);
      // based on the sample config - I know the post processed value should be test
      expect(item[1]).to.be.equal('test');
    });
  });

  describe('table with provided options', function () {
    it('should mix in default options with provided options', function () {
      var summary = configSummary(debugInfo, {
        format: 'table'
      });
      expect(summary.options.head).to.eql(['path', 'value',
        'source'

      ]);
    });

    it('should only display columns provided', function () {

      var summary = configSummary(debugInfo, {
        format: 'table',
        include: ['P']
      });
      expect(summary.options.head).to.eql(['path']);
    });

    it('should combine source and source location if SSL is provided',
      function () {
        var summary = configSummary(debugInfo, {
          format: 'table',
          include: ['S', 'SL', 'SSL']
        });
        var row = summary[0];
        expect(summary.options.head).to.eql(['source',
          'source location', 'source'
        ]);
        expect(row[0]).to.be.equal('appEnvironment');
        expect(row[1]).to.be.equal(
          '/app/config/configurationInfoTest.json');
        expect(row[2]).to.be.equal(
          'AE - /app/config/configurationInfoTest.json');
      });

    it('should display pre-processed values if pre is an option',
      function () {
        var summary = configSummary(debugInfo, {
          format: 'table',
          display: 'pre',
          include: ['P', 'AD']

        });

        var item = _.find(summary, function (i) {
          return i.path === 'section3.key2';

        });
        expect(item[1]).to.be.equal('env:___RANDOM__TEST');
      });

  });


  describe('raw format of summary', function () {

    describe('with default options other than raw', function () {
      var summary;

      before(function () {
        summary = configSummary(debugInfo, {
          format: 'raw'
        });
      });

      it('should have the format set to raw', function () {
        expect(summary.format).to.be.equal('raw');
      });

      it(
        'should be an array of objects with a property for the default includes',
        function () {
          expect(_.isArray(summary)).to.be.truthy;
          expect(summary[0]).to.have.property('path');
          expect(summary[0]).to.have.property('value');
          expect(summary[0]).to.have.property('source');

        });

      it('should return the post processed values', function () {
        var item = _.find(summary, function (i) {
          return i.path === 'section3.key2';
        });
        expect(item['value']).to.be.equal('test');
      });
    });

    describe('raw with other options', function () {
      it('should only include specified columns', function () {
        var summary = configSummary(debugInfo, {
          format: 'raw',
          include: ['P', 'V']
        });
        expect(summary[0]).to.have.property('path');
        expect(summary[0]).to.have.property('value');
        expect(summary[0]).to.not.have.property('base default');
      });

      it('should display pre-processed values', function () {
        var summary = configSummary(debugInfo, {
          format: 'raw',
          include: ['P', 'V', 'AD'],
          display: 'pre'
        });
        var item = _.find(summary, function (i) {
          return i.path === 'section3.key2';
        });
        expect(item['app default']).to.be.equal(
          'env:___RANDOM__TEST');
      });
    });
  });
});