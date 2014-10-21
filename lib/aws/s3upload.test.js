/* jshint expr:true */
/* global require, describe, it, before, after */

'use strict';

var supertest = require('supertest');
var express = require('express');
var multer  = require('multer');
var expect = require('chai').expect;

var s3upload = require('./s3upload');
var config = require('../config');

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

    var access = process.env.AWS_ACCESS;
    var secret = process.env.AWS_SECRET;
    var bucket = process.env.AWS_S3_BUCKET;

    var awsconf = {
      global: {
        accessKeyId: access,
        secretAccessKey: secret
      },

      s3: {
        bucket: bucket,

        makeKey:  function(file) {
          return 'filename';
        },

        respond: function (req, res, s3keys) {
          console.log(s3keys);
          res.send(200, {
            file: {
              url: 'http://' + bucket + '.s3-website-us-east-1.amazonaws.com/'
                  + s3keys.attachments
            }
          });
        }
      }
    };

    var fpath = process.cwd() + '/test-data/static-test/koast.txt';
    console.log(fpath);

    var uploader = s3upload.makeS3FileUploader(awsconf.global, awsconf.s3);

    var app = express();
    app.use(multer());
    app.post('/x', uploader);

    supertest(app)
      .post('/x')
      .attach('attachments', fpath)
      .end(function(err, res) {
        var url = JSON.parse(res.text).file.url;
        expect(url).to.equal('http://' + bucket +
            '.s3-website-us-east-1.amazonaws.com/filename');

        //this URL may break.
        supertest('http://' + bucket + '.s3-website-us-east-1.amazonaws.com')
          .get('/filename')
          .expect(200)
          .end(function(err, res) {
            expect(res.text).to.equal('koast\n');
            done(err);
          });
      });

  });
});
