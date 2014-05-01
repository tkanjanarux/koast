/* globals require, exports */
'use strict';

// This is tentative (untested) implementation of password authentication.

var passport = require('passport');
var bcrypt = require('bcrypt');
var Q = require('q');
var expect = require('chai').expect;
var LocalStrategy = require('passport-local').Strategy
var log = require('../log');

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
};

exports.setup = function(app, users, config) {
  // Setup the authentication strategy
  var strategy = new LocalStrategy(makeVerifyFunction(users, config));
  passport.use(strategy);
  // Setup a route using that strategy
  app.post('/auth/login', function(req, res, next) {
    console.log('/auth/login', req.query.username, req.query.password);
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        console.log(err);
        return next(err)
      }
      if (!user) {
        req.logout();
        res.send(401, 'Wrong password or no such user.');
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
}