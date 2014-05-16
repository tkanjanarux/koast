/* globals describe, it, chai, console */

'use strict';
var expect = chai.expect;

describe('koast-user', function() {
  testMakeRequestUrl('http://alertsmd.com');
});

describe('koast-user', function() {
  // This tests the baseUrl logic
  testMakeRequestUrl('http://alertsmd.com/foo/booo/1234');
});




function testMakeRequestUrl(baseUrl) {

  beforeEach(angular.mock.module('koast-user'));
  beforeEach(module(function($provide) {

    $provide.service('$location', function() {
      var service = {};
      service.absUrl = function() {
        return baseUrl;
      };
      return service;
    });
  }));

  it('should make a request url', function() {

    inject(function(_koastOauth) {
      expect(_koastOauth.makeRequestURL()).to.not.be.undefined;
      expect(_koastOauth.makeRequestURL('car')).to.equal('http://alertsmd.com/car');
      expect(_koastOauth.makeRequestURL('/car')).to.equal('http://alertsmd.com//car');
      expect(_koastOauth.makeRequestURL('')).to.equal('http://alertsmd.com/');
      expect(_koastOauth.makeRequestURL()).to.equal('http://alertsmd.com/');
      expect(_koastOauth.makeRequestURL('false')).to.equal('http://alertsmd.com/false');
      expect(_koastOauth.makeRequestURL(null)).to.equal('http://alertsmd.com/');
      expect(_koastOauth.makeRequestURL(false)).to.equal('http://alertsmd.com/');


      _koastOauth.setBaseUrl('http://anotherserver.ca');
      expect(_koastOauth.makeRequestURL(false)).to.equal('http://anotherserver.ca');
      expect(_koastOauth.makeRequestURL('/car')).to.equal('http://anotherserver.ca/car');
      expect(_koastOauth.makeRequestURL('/car')).to.equal('http://anotherserver.ca/car');

    });
  });
}


describe('koast-user', function() {

  var baseUrl = 'http://alertsmd.com/foo/bar';

  beforeEach(angular.mock.module('koast-user'));
  beforeEach(module(function($provide) {

    $provide.service('$location', function() {
      var service = {};
      service.absUrl = function() {
        return baseUrl;
      };
      return service;
    });

    $provide.service('$window', function() {
      var service = {};
      service.location = {
        replace: sinon.spy()
      };
      return service;
    });
  }));



  it('should initiateAuthentication', function() {
    inject(function(_koastOauth, $window) {
      var someProvider = 'someProvider';
      _koastOauth.initiateAuthentication(someProvider);
      $window.location.replace.should.have.been.calledOnce;
      $window.location.replace.should.have
        .been.calledWith('http://alertsmd.com//auth/someProvider?next=http%3A%2F%2Falertsmd.com%2Ffoo%2Fbar');
    });
  });
});