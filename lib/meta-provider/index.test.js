/* global describe,it,should, before,beforeEach, require */
/* jshint expr:true */

'use strict';

var expect = require('chai').expect;
var express = require('express');
var supertest = require('supertest');

describe('meta-provider version check', function () {

  function getUrl(version) {
    return '/meta/koast-angular/check-compatability?koast-version=' +
      encodeURIComponent(version);
  }

  function makeExpressApp(version) {
    var app = express();
    var options;
    if (version) {
      options = {
        version: version
      };
    }
    app.use(require('../meta-provider')(options));
    return app;
  }

  it('should use the provided options.version if provided', function (done) {

    var app = makeExpressApp('0.0.0');
    supertest(app).get(getUrl('>=0.0.0'))
      .end(function (err, res) {
        expect(res.status).to.be.equal(200);
        expect(res.body.koastVersion).to.be.equal('0.0.0');
        done();
      });
  });

  it('should use package.json if options.version is not provided',
    function (done) {
      var app = express();
      var expected = require('../../package.json').version;
      app.use(require('../meta-provider')());

      supertest(app).get(getUrl('>=0.0.0'))
        .end(function (err, res) {
          expect(res.body.koastVersion).to.be.equal(expected);
          done();
        });
    });

  it('should return an object with an isCompatible set to true', function (
    done) {
    var app = makeExpressApp('0.0.0');

    supertest(app).get(getUrl('>=0.0.0'))
      .end(function (err, res) {
        expect(res.status).to.be.equal(200);
        expect(res.body.isCompatible).to.be.equal(true);
        done();
      });

  });

  it('should return an object with an isCompatible set to true', function (
    done) {

    var app = makeExpressApp('0.0.0');

    supertest(app).get(getUrl('>=1.0.0'))
      .end(function (err, res) {
        expect(res.status).to.be.equal(200);
        expect(res.body.isCompatible).to.be.equal(false);
        done();
      });

  });

  it('should have a status 400 if query paramater is not provided',
    function (done) {
      var app = makeExpressApp();

      supertest(app).get('/meta/koast-angular/check-compatability')
        .end(function (err, res) {
          expect(res.status).to.be.equal(400);
          done();
        });
    });

  it('should have a status 400 if query paramater has no value',
    function (done) {

      var app = makeExpressApp();
      app.use(require('../meta-provider')());
      supertest(app).get(getUrl(''))
        .end(function (err, res) {
          expect(res.status).to.be.equal(400);
          done();
        });
    });


});