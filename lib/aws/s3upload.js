/** @module koast/aws */
/* global exports, require */

'use strict';

var fs = require('fs');
var expect = require('chai').expect;

/**
 * Returns a connect handler which uploads data from
 * req.files.attachments to a specified S3 bucket.
 *
 *
 * AWS options:
 * <pre><code>
 * {
 *   accessKeyId: String,
 *   secretAccessKey: String
 * }
 * </code></pre>
 *
 *
 * S3 options:
 * <pre><code>
 * {
 *   bucket: String,
 *   makeKey: Function(req),
 *   respond: Function(req, res)
 * }
 * </code></pre>
 *
 * s3opts.makeKey should return the name of the file you wish
 * to save the uploaded file as on the s3 bucket.
 *
 * s3opts.respond should actually write the response to the user
 *
 * @param {Object} options TODO
 */
exports.makeS3FileUploader = function (awsOpts, s3opts) {

  


  var AWS;
  var s3;

  try {
    AWS = require('aws-sdk');

    // Add properties of awsOpts to AWS.config
    AWS.config.update(awsOpts);

    s3 = new AWS.S3();
  } catch (e) {
    throw e;
  }

  return function (req, res) {

    var file = req.files.attachments;

    var key = s3opts.makeKey(req);
    var params = {
      Bucket: s3opts.bucket,
      Key: key,
      Body: fs.createReadStream(file.path),
      ACL: s3opts.acl,
      ContentType: file.mimetype
    };

    s3.putObject(params, function (err) {
      if (err) {
        console.log(err);
        throw err;
      } else {
        s3opts.respond(req, res, key);
      }
    });

  };
};

