/*global require, describe, it */
var express = require('express');
var bodyParser = require('body-parser');
var supertest = require('supertest');

var backup = require('./backup');
var dbUtils = require('../../database/db-utils');
var log = require('../../log');


var access = process.env.AWS_ACCESS;
var secret = process.env.AWS_SECRET;
var bucket = process.env.AWS_S3_BUCKET;


function getExpressApp() {
  var app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  return app;
}


describe('AWS Backup', function() {

  this.timeout(11000);

  var dbConfig = {
    'host': '127.0.0.1',
    'port': '27017',
    'db': 'testdb'
  };

  var schemas = [{
    name: 'testcollection',
    properties: {
      prop: {
        type: Number,
        required: true
      }
    }
  }];

  var dbConn = dbUtils.createSingleConnection('testdb', dbConfig, schemas);

  it('should be a useless test', function(done) {
    dbConn.then(function(conn) {

      var app = getExpressApp();

      app.post('/x', backup.initiateBackupHandler(conn, ['testcollection', 'a'],
          function(data, id, start, done) {
            done(id);
          }));
      app.get('/x/:backupId', backup.retrieveBackupStatus);


      // TODO expectations for the tests

      var st = supertest(app);

      st.post('/x')
        .end(function(err, res) {
          var data = JSON.parse(res.text);

          st.get('/x/' + data.id)
            .end(function(err, res) {
              var data2 = JSON.parse(res.text);
              // Should print false
              console.log('FINISHED', data2.finished);
            });

          
          setTimeout(function() {
            st.get('/x/' + data.id)
              .end(function(err, res) {
                var data2 = JSON.parse(res.text);

                // Should print true
                console.log('FINISHED', data2.finished);
                console.log('SUCCESS', data2.success);
                if(data2.finshed && data2.success) { done(); }
              });
          }, 4000);
        });

    });
  });

  it('Should upload to AWS', function(done) {
    dbConn.then(function(conn) {
      var app = getExpressApp();

      var awsconf = {
        global: {
          accessKeyId: access,
          secretAccessKey: secret
        },

        s3: {
          bucket: bucket
        }
      };

      var uploader = backup.getS3ZipUploader(awsconf.global, awsconf.s3);

      app.get('/x/:backupId', backup.retrieveBackupStatus);
      app.post('/x', backup.initiateBackupHandler(conn,
            ['testcollection', 'a'], uploader));

      
      var st = supertest(app);

      st.post('/x')
        .end(function(err, res) {
          var data = JSON.parse(res.text);

          st.get('/x/' + data.id)
            .end(function(err, res) {
              var data2 = JSON.parse(res.text);
              // Should print false
              console.log('FINISHED', data2.finished);
            });

          
          setTimeout(function() {
            st.get('/x/' + data.id)
              .end(function(err, res) {
                if(err) {
                  log.error(err);
                }
                var data2 = JSON.parse(res.text);

                // Should print true
                console.log('FINISHED', data2.finished);
                console.log('SUCCESS', data2.success);

                if(data2.finished && data2.success) { done(); }

              });
          }, 4000);
        });
      
    });
  });
});
