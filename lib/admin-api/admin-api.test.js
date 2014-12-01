'use strict';

var q = require('q');
var express = require('express');
var supertest = require('supertest');

var adminApi = require('./admin-api');

var mongoUrl = 'mongodb://localhost:27017/dumptestdb';

var access = process.env.AWS_ACCESS;
var secret = process.env.AWS_SECRET;
var bucket = process.env.AWS_S3_BUCKET;

function getApp() {
  var app = express();
  var router = adminApi.getS3BackupRouter(
    '/s3', ['multi_a', 'multi_b'], mongoUrl, {
      global: {
        accessKeyId: access,
        secretAccessKey: secret
      },

      s3: {
        bucket: bucket
      }
    });

  app.use(router);
  return app;
}


xdescribe('Should support multibackups multibackup', function() {
  it('Should run multiBinary', function(done) {
    var app = getApp();
    var st = supertest(app)

    st.post('/s3')
      .end(function(err, res) {
        if(err) { throw err; }

        //TODO figure out how to test this.
        // but if this doesn't fail... good start
        //

        if(res.body.id) {
          done();
        }
      });
  });
});

describe('Route discovery', function() {
  it('Should list routes', function(done) {

    var configureApi = function(register) {
      var router = express.Router();
      router.get('/s3/:id', function() {});
      router.post('/s3', function() {});

      register({
        router: router,
        type: 'backup',
        name: 's3backup',
        mount: '/backup'
      });

      var d = q.defer();
      d.resolve();
      return d.promise;
    };

    var router = adminApi.getRouter(configureApi)
      .then(function(router) {
        var app = express();
        app.use(router);

        var st = supertest(app);
        st.get('/discovery')
          .end(function(err, res) {
            console.log(res.body);
            console.log(res.body.s3backup.paths);
            if(res.body.s3backup.type === 'backup') {
              done();
            }
          });
      });
  });
});
