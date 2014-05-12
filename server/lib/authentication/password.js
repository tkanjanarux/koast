/* globals require, exports */
'use strict';

// This is tentative (untested) implementation of password authentication.

var passport = require('passport');
var bcrypt = require('bcrypt');
var Q = require('q');
var expect = require('chai').expect;
var LocalStrategy = require('passport-local').Strategy;
var log = require('../log');

var async = require('async');
var crypto = require('crypto');
var mailerMaker = require('../mailer').mailerMaker;
var nodemailer = require('nodemailer');


function comparePasswords(password1, password2) {
  var deferred = Q.defer();
  bcrypt.compare(password1, password2, deferred.makeNodeResolver());
  return deferred.promise;
}

function makeHandlers (done) {
  return {
    reject: function (message) {
      done(null, false, {
        message: 'No such user or wrong password.'
      });
    },
    accept: function (user) {
      done(null, user);
    },
    reportError: function (error) {
      log.error(error);
      log.error(error.stack);
      done(error, false, {
        message: 'Sorry something went wrong. Please try again later.'
      });
    }
  };
}

function makeVerifyFunction (users, config) {
  return function verify(username, password, done) {
    log.debug('Verifying:', username, password);
    var userQuery = {
      username: username
    };
    var handlers = makeHandlers(done);
    users.findOne(userQuery).exec()
      .then(function(user) {
        if (!user){
          done(null, false); // reject
          return;
        }

        user = user.toObject();
        log.debug('found:', user);
        if (!user) {
          done(null, false); // reject
        } else {
          expect(user.username).to.equal(username);
          log.debug('passport.localStrategy: found user %s.', username);
          return comparePasswords(password, user.password)
            .then(function(accept) {
              done(null, accept && user); // accept
            });
        }
      })
      .then(null, done); // report error
  };
}

exports.setup = function(app, users, config) {
  var pwMailer = mailerMaker();

  // Setup the authentication strategy
  var strategy = new LocalStrategy(makeVerifyFunction(users, config));
  passport.use(strategy);
  // Setup a route using that strategy
  app.post('/auth/login', function(req, res, next) {
    console.log('/auth/login', req.query.username, req.query.password);
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        console.log(err);
        return next(err);
      }
      if (!user) {
        req.logout();
        res.send(422, 'Wrong password or no such user.');
      } else {
        req.login(user, function(err) {
          if (err) {
            return next(err);
          }
          return res.send(200, user);
        });
      }
    })(req, res, next);
  });

  app.post('/forgot', function(req, res) {
    async.waterfall([

      function(done) {
        // Generate token
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        // Find user and set token and token expiry date
        users.findOne({
          email: req.body.email
        }, function(err, user) {
          if (!user) {
            var errMsg = 'No account with that email address exists.';
            log.error(errMsg);
            return res.send(422, errMsg);
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        // Send email
        var mail = pwMailer.initEmail();
        mail.text = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        mail.to = user.email;
        mail.subject = 'Password Reset';


        pwMailer.sendMail(mail, function(err, result) {
          log.info('An e-mail has been sent to ' + user.email + ' with reset password instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return res.send(500, err);
      return res.send(200, {});
    });
  });

  app.get('/reset/:token', function(req, res) {
    users.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: {
        $gt: Date.now()
      }
    }, function(err, user) {
      if (!user) {
        return res.send(422, 'Password reset token is invalid or has expired.');
      } else {
        return res.send(200, {});
      }
    });
  });


  app.post('/reset/:token', function(req, res) {
    async.waterfall([

      function(done) {
        users.findOne({
          resetPasswordToken: req.params.token,
          resetPasswordExpires: {
            $gt: Date.now()
          }
        }, function(err, user) {
          if (!user) {
            return res.send(422, 'Password reset token is invalid or has expired.');
          }

          user.password = req.body.password; // TODO HASH this
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
            if (err){
              return res.send(500, err);
            } else {
              done(err, user);
            }
          });
        });
      },
      function(user, done) {

        var mail = pwMailer.initEmail();
        mail.to = user.email;
        mail.subject = 'Your password has been changed';
        mail.text = 'You have successfully changed your password';

        pwMailer.sendMail(mail, function(err, result) {
          log.info('An e-mail has been sent to ' + user.email + ' indicating successful password change.');
          done(err, 'done');
        });

      }
    ], function(err) {
      if (err) return res.send(500, err);
      return res.send(200, {});
    });
  });
};
