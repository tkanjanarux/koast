/* jshint expr:true */
/* global require, describe, it, console */

'use strict';

var expect = require('chai').expect;

var config = require('../config');
var pushNotifier = require('./push-notifier');

describe('Test push notifications.', function () {
  var notifyConfig;
  var notifier;

  before(function(done) {
    config.setConfigDirectory(process.cwd() + '/test-data', {
      force: true
    });
    return config.setEnvironment('test', { //config.loadConfiguration()
      force: true
    }).then(function () {
      notifyConfig = config.getConfig('notifications');
      done();
      return;
    });
  });

  it('Get default notifier.', function(done) {
    notifier = pushNotifier.getPushNotifier();
    expect(notifier).to.exist;
    expect(notifier.deviceTypes).to.exist;
    expect(notifier.send).to.exist;
    done();
  });

  it('Get non-default notifier from config.', function(done) {
    var otherNotifier = pushNotifier.getPushNotifier("notificationsOther");
    expect(otherNotifier).to.exist;
    expect(otherNotifier.deviceTypes).to.exist;
    expect(otherNotifier.send).to.exist;
    done()
  });

  it('Attempts to send GCM push notification.', function(done) {
    notifier.send("fake_id", notifier.deviceTypes.ANDROID, {}, function(err, data) {
      console.log(err);
      console.log("data:", data);
      done();
    });
  });

  it('Attempts to send IOS push notification.', function(done) {
    notifier.send("fake_id", notifier.deviceTypes.IOS, {}, function(err, data) {
      expect(err).to.be.null;
      expect(data).to.be.empty;
      done();
    });
  });

  it('Attempts to send web simulation push notification.', function(done) {
    notifier.send("fake_id", notifier.deviceTypes.WEB, {}, function(err, data) {
      //expect(err).to.be.null;
      expect(data).to.not.exist;
      done();
    });
  });
});