/* jshint expr:true */
/* global require, describe, it, console */

'use strict';

var expect = require('chai').expect;

var config = require('../config');
var pushNotifier = require('./push-notifier');

describe('Test push notifications.', function () {
  var notifyConfig;
  var sendNotification;
  var payload;
  var deviceID = "mock";

  before(function(done) {
    payload = {
      title: "MyTestApp",
      message: "Something new happened!",
      someID: 12345
    };
    config.setConfigDirectory(process.cwd() + '/test-data', {
      force: true
    });
    return config.loadConfiguration('test', {
      force: true
    }).then(function () {
      notifyConfig = config.getConfig('notifications');
      return done();
    });
  });

  it('Get default notifier.', function(done) {
    var deviceTypes = pushNotifier.deviceTypes;
    expect(deviceTypes).to.exist;

    sendNotification = pushNotifier.getSender();
    expect(sendNotification).to.exist;
    
    done();
  });

  it('Get non-default notifier from config.', function(done) {
    var otherSendFunction = pushNotifier.getSender("notificationsOther");
    expect(otherSendFunction).to.exist;
    done()
  });

  it('Attempts to send GCM push notification.', function(done) {
    sendNotification(deviceID, pushNotifier.deviceTypes.ANDROID, payload, function(err, data) {
      expect(err).to.be.null;
      expect(data).to.be.empty;
      done();
    });
  });

  it('Attempts to send IOS push notification.', function(done) {
    sendNotification(deviceID, pushNotifier.deviceTypes.IOS, payload, function(err, data) {
      expect(err).to.be.null;
      expect(data).to.be.empty;
      done();
    });
  });

  it('Attempts to send web simulation push notification.', function(done) {
    sendNotification(deviceID, pushNotifier.deviceTypes.WEB, payload, function(err, data) {
      expect(data).to.not.exist;
      expect(err).to.exist;
      done();
    });
  });
});