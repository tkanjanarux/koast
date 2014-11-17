/** @module lib/authentication/domainRestriction */
/* global require, exports */
'use strict';

var _ = require('lodash');

// Allows restriction of oauth login to specified domains
// ie: The HRangle web portal only allows user with a rangle.io google account

// Get List of Domains from Email array //
function getDomainList(data) {
  var domains = [];

  _.each(data.emails, function(emailObject) {
    domains.push(emailObject.value.split('@')[1]);
  });

  return domains;
}

// Trim any pesky whitespace //
function trimPermittedDomains(permittedDomains) {
  var trimmedPermittedDomains = [];

  _.each(permittedDomains, function(permittedDomain) {
    trimmedPermittedDomains.push(permittedDomain.trim());
  });

  return trimmedPermittedDomains;
}

// Check that the users domain is present in list of permitted domains //
function userDomainIsPermitted(userDomains, permittedDomains) {
  var isPermitted = false;

  _.each(permittedDomains, function(permittedDomain) {
    _.each(userDomains, function(userDomain) {
      if(userDomain.toUpperCase() === permittedDomain.toUpperCase()) {
        isPermitted = true;
      }
    });
  });

  return isPermitted;
}

function isUserPermitted(options, data) {
  var permittedDomains = trimPermittedDomains(options.restrictToTheseDomains.split(','));
  var userDomains = getDomainList(data);

  return userDomainIsPermitted(userDomains, permittedDomains);
}

module.exports.isUserPermitted = isUserPermitted;
