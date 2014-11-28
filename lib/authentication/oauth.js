/** @module lib/authentication/oauth */
/* global require, exports */
'use strict';

var passport = require('passport');
var Q = require('q');
var strategies = {};

var log = require('../log');
var jwt = require('jsonwebtoken');
var config = require('../config');
var domainRestriction = require('./domainRestriction');
// Should be made configurable eventually.
var oauthOptions = {
  google: {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    session: false
  },
  facebook: {
    session: false,
    scope: [],
  },
  twitter: {
    scope: [],
    session: false
  }
};

/**
 * Looks up user in the database and generates an enveloped user record based
 * on that.
 *
 * @function getUserFromProfile
 * @param {todo} providerAccounts  TODO
 * @param {todo} profile  TODO
 */
exports.getUserFromProfile = function (providerAccounts, profile) {
  log.debug(profile);
  if (!profile) {
    return Q.resolve();
  }
  var query = {
    provider: profile.provider,
    idWithProvider: profile.idWithProvider
  };

  return providerAccounts.find(query).exec()
    .then(function (results) {
      var userRecord = {
        isAuthenticated: true,
        meta: {}
      };
      if (results && results.length > 0) {
        log.debug('Old user!', results[0]);
        userRecord.data = results[0];
        if (userRecord.data.username) {

          userRecord.meta.isRegistered = true;
        } else {
          userRecord.meta.isRegistered = false;
        }
      }

      return userRecord;
    });
};

// Makes a handler to be called after the user was authenticated with an OAuth
// provider.
function makeLoginHandler(provider, providerAccounts) {
  return function (accessToken, refreshToken, profile, done) {
    log.debug('Authentiated for ' + provider);
    log.debug(profile);

    profile.provider = provider;
    profile.idWithProvider = profile.id;
    exports.getUserFromProfile(providerAccounts, profile)
      .then(function (userRecord) {

        // Save the user if they are new.
        var fieldsToCopy = ['provider', 'displayName', 'emails'];
        if (userRecord && userRecord.data) {

          return userRecord;
        } else {
          userRecord = {
            isAuthenticated: true
          };
          userRecord.meta = {
            isRegistered: false
          };
          userRecord.data = {
            idWithProvider: profile.id,
          };
          fieldsToCopy.forEach(function (key) {
            userRecord.data[key] = profile[key];
          });

          return providerAccounts.create(userRecord.data)
            .then(function () {
              return userRecord;
            });
        }
      })
      .then(function (userRecord) {
        done(null, userRecord);
      })
      .then(null, function (error) {
        log.error(error);
        done(error);
      })
      .then(null, log.error);
  };
}

// Redirects the user to the new url.
function redirectToNext(req, res) {
  var redirectTo = req.session.next || '';
  req.session.next = null; // Null it so that we do not use it again.
  res.redirect(redirectTo);
}

// This function is invoked when the user hits an /auth/<provider> route.  It
// gets a redirection value from the query string ('next') and stores it in
// the session. When the authorization is complete, we read this value to
// determine where the user should go next.
function saveNextUrl(req, res, next) {

  //req.session.next = req.query.next || null;
  next();
}

function setupCookieHandlers(app, provider, options, providerAccounts) {
  if (options.authenticationModule) {
    // if authenticationModule is present, koast app would like to provide their own callback function
    var koastAppAuthenticationModule = require(options.authenticationModule);
  }

  app.get(
    '/auth/' + provider,
    // saveNextUrl,
    passport.authenticate(provider, oauthOptions[provider])
  );

  // Add a route where the provider would send afterwards.
  app.get(
    '/auth/' + provider + '/callback',
    passport.authenticate(provider, {
      failureRedirect: '/',
    }),
    function (req, res) {

      if (options.restrictToTheseDomains) {
        // authentication requires domain restriction if this option is present
        // check with domainRegistration module
        if (!domainRestriction.isUserPermitted(options, req.user.data)) {
          // users domain is NOT on the whitelist //
          // at this point the user is actually logged in with passport so we need to log them out
          req.logout();
        }
      }



      if (koastAppAuthenticationModule) { // if authenticationModule is present, koast app would like to provide their own callback function
        // delegate to consuming app by calling the provided callback
        koastAppAuthenticationModule.authenticationCallback(req, res); // this module will handle success and failure and do redirect
      } else {
        res.redirect('/'); // do success redirect
      }

    }
  );
}

function setupTokenHandlers(app, provider, options, providerAccounts) {
  var returnUrl = config.getConfig('authentication').clientReturnUrl;
  var secrets = config.getConfig('secrets');
  oauthOptions[provider].session = false;

  app.get(
    '/auth/' + provider,
    saveNextUrl,
    passport.authenticate(provider, oauthOptions[provider])
  );

  // Add a route where the provider would send afterwards.

  app.get(
    '/auth/' + provider + '/callback',
    passport.authenticate(provider, {
      failureRedirect: '/',
      session: false
    }),
    function (req, res) {

      req.session = null;

      function getExpirationTime(offsetInMinutes) {
        var now = new Date();
        now.setMinutes(now.getMinutes() + offsetInMinutes);
        return now.toISOString();
      }
      var token;
      var profile;
      var tokenExpiresInMinutes;
      //  need to look in db to see if this id/provider exists
      // and set username?
      profile = {
        username: req.user.data.username,
        email: req.user.email,
        userdata_id: req.user.data._id,
        idWithProvider: req.user.data.idWithProvider,
        provider: provider,
        displayName: req.user.data.username
      };
      /* jshint ignore:end */
      tokenExpiresInMinutes = 5;
      token = jwt.sign({
        data: profile
      }, secrets.authTokenSecret, {
        expiresInMinutes: tokenExpiresInMinutes
      });

      res.redirect(returnUrl + '#?redirectToken=' +
        token);
    }
  );
}

// setup strategies that we can use
// google OAuth2Strategy requires session, which we do not
// setup if using token

function setupStrategies(auth) {
    var result = {};
    if (auth.maintenance === 'token') {
      result = {

        facebook: require('passport-facebook').Strategy,
        twitter: require('passport-twitter').Strategy
      };
    } else {
      result = {
        google: require('passport-google-oauth').OAuth2Strategy,
        facebook: require('passport-facebook').Strategy,
        twitter: require('passport-twitter').Strategy
      };
    }
    return result;
  }
  /*
   * Sets up OAuth authentication for one provider.
   *
   * @function init
   * @param {TODO} app TODO
   * @param {TODO} provider TODO
   * @param {TODO} options TODO
   * @param {TODO} providerAccounts TODO
   */
exports.init = function (app, provider, options, providerAccounts) {
  strategies = setupStrategies(config.getConfig('authentication'));
  log.verbose('initalizing', provider);


  var Strategy = strategies[provider];
  var handler = makeLoginHandler(provider, providerAccounts);

  passport.use(new Strategy(options, handler));
  if (config.getConfig('authentication').maintenance === 'cookie') {
    setupCookieHandlers(app, provider, options, providerAccounts);
  } else {
    setupTokenHandlers(app, provider, options, providerAccounts);
  }


};