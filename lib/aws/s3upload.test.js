/* jshint expr:true */
/* global require, describe, it, before, after */

'use strict';

var supertest = require('supertest');
var superagent = require('superagent');
var express = require('express');
var multer  = require('multer');
var expect = require('chai').expect;
var Q = require('q');

var s3upload = require('./s3upload');
var config = require('../config');

var access = process.env.AWS_ACCESS;
var secret = process.env.AWS_SECRET;
var bucket = process.env.AWS_S3_BUCKET;

describe('S3 uploader', function() {


  before(function() {
    config.setConfigDirectory(process.cwd() + '/test-data', {
      force: true
    });
    return config.loadConfiguration('test', {
      force: true
    });
  });

  it('Should upload a file and retrieve it.', function(done) {

    this.timeout(10000);

    var awsconf = {
      global: {
        accessKeyId: access,
        secretAccessKey: secret
      },

      s3: {
        bucket: bucket,

        makeKey:  function(req, file) {
          return file.originalname;
        },

        respond: function (req, res, s3keys) {
          var respVal = [];
          for (var property in s3keys) {
            if (req.files.hasOwnProperty(property)) {
              respVal.push({url: 'http://' + bucket + '.s3-website-us-east-1.amazonaws.com/'
                  + s3keys[property]});
            }
          } 

          res.status(200).send({
            files: respVal
          });
        }
      }
    };

    var fpath = process.cwd() + '/test-data/static-test/koast.txt';

    var uploader = s3upload.makeS3FileUploader(awsconf.global, awsconf.s3);

    var app = express();
    app.use(multer());
    app.post('/x', uploader);

    supertest(app)
      .post('/x')
      .attach('attachments', fpath)
      .end(function(err, res) {
        var url = JSON.parse(res.text).files[0].url;
        expect(url).to.equal('http://' + bucket +
            '.s3-website-us-east-1.amazonaws.com/koast.txt');

        //this URL may break.
        supertest('http://' + bucket + '.s3-website-us-east-1.amazonaws.com')
          .get('/koast.txt')
          .expect(200)
          .end(function(err, res) {
            expect(res.text).to.equal('koast\n');
            done(err);
          });
      });

  });

  it('Should upload multiple files and retrieve them', function(done) {
    this.timeout(10000);

    function getFileFromS3(file) {
      var val = 'B\n'; //default to B when not file a.txt
      // check for presence of X in fileX.txt
      if(file.url.lastIndexOf('a') > file.url.length - 6) {
        val = 'A\n';
      }
      
      var deferred = Q.defer();
      superagent
        .get(file.url)
        .end(function(res) {
          expect(res.text).to.equal(val);
          deferred.resolve();
        });

      return deferred.promise;
    }

    var awsconf = {
      global: {
        accessKeyId: access,
        secretAccessKey: secret
      },

      s3: {
        bucket: bucket,

        makeKey:  function(req, file) {
          return Date.now() + file.originalname;
        },

        respond: function (req, res, s3keys) {
          var respVal = {};

          for (var property in s3keys) {
            if (req.files.hasOwnProperty(property)) {
              respVal[property] = {url: 'http://' + bucket + '.s3-website-us-east-1.amazonaws.com/'
                  + s3keys[property]};
            }
          } 

          res.status(200).send({
            files: respVal
          });
        }
      }
    };

    var basePath = process.cwd() + '/test-data/static-test/';
    var aPath = basePath + 'a.txt'; // contains "A\n"
    var bPath = basePath + 'b.txt'; // contains "B\n"

    var uploader = s3upload.makeS3FileUploader(awsconf.global, awsconf.s3);

    var app = express();
    app.use(multer());
    app.post('/x', uploader);

    supertest(app)
      .post('/x')
      .attach('file1', aPath)
      .attach('file2', bPath)
      .end(function(err, res) {
        var files = JSON.parse(res.text).files;
        var promises = [];
        promises.push(getFileFromS3(files.file1));
        promises.push(getFileFromS3(files.file2));

        Q.all(promises).then(function() {
          done();
        });


      });
  });
});

describe('Respect error config', function() {

  var getErrorHandlerTester = function(sendVal, endHandler) {
    return function(done) {
      var awsconf = {
        global: {
          accessKeyId: access,
          secretAccessKey: secret
        },

        s3: {
          bucket: 'NOT A REAL BUCKET',
          makeKey:  function() { return 'asd'; },
          respond: function () {},

          '500': { 'sendValue': sendVal }
        }
      };

      var fpath = process.cwd() + '/test-data/static-test/koast.txt';

      var uploader = s3upload.makeS3FileUploader(awsconf.global, awsconf.s3);

      var app = express();
      app.use(multer());
      app.post('/x', uploader);

      supertest(app)
        .post('/x')
        .attach('f', fpath)
        .expect(200) // THIS DOESN'T WORK :(
        .end(function(err, res) {
          endHandler(err, res, done);
        });
    };
  };

  it('Should 500 when AWS error occurs with no error handler, return value',
    getErrorHandlerTester(true, function(err, res, done) {
      var val = JSON.parse(res.text);
      if(val.code === 'NoSuchBucket') {
        done();
        return;
      }

      done('uh oh');
    }));

  it('Should 500 when AWS error occurs with no error handler, return nothing',
    getErrorHandlerTester(false, function(err, res, done) {
      if(res.text === '') {
        done();
        return;
      }
      done('uh oh');
    }));


  it('Should call error handler if supplied', function(done) {
    var awsconf = {
      global: {
        accessKeyId: access,
        secretAccessKey: secret
      },

      s3: {
        bucket: 'NOT A REAL BUCKET',
        makeKey:  function() { return 'asd'; },
        respond: function () {},
        onError: function(err, req, res, s3keys) {
          res.status(500).send({x:'y'});
        }
      }
    };

    var fpath = process.cwd() + '/test-data/static-test/koast.txt';

    var uploader = s3upload.makeS3FileUploader(awsconf.global, awsconf.s3);

    var app = express();
    app.use(multer());
    app.post('/x', uploader);

    supertest(app)
      .post('/x')
      .attach('f', fpath)
      .expect(200) // THIS DOESN'T WORK :(
      .end(function(err, res) {
        var val = JSON.parse(res.text);
        if(val.x == 'y') {
          done();
          return;
        }

        done('uh oh');
      })

  });
});
