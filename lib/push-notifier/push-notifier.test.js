/* jshint expr:true */
/* global require, describe, it, before, console */

'use strict';

var expect = require('chai').expect;

var config = require('../config');
var pushNotifier = require('./push-notifier');

describe('Test push notifications.', function () {
  var notifyConfig, otherConfig;
  var sendNotification;
  var payload;
  var deviceID = 'mock';

  before(function(done) {
    payload = {
      title: 'MyTestApp',
      message: 'Something new happened!',
      someID: 12345
    };
    config.setConfigDirectory(process.cwd() + '/test-data', {
      force: true
    });
    return config.loadConfiguration('test', {
      force: true
    }).then(function () {
      notifyConfig = config.getConfig('notifications');
      console.log(notifyConfig);
      return done();
    });
  });

  it('Check for valid notifications config.', function(done) {
    expect(notifyConfig.android).to.exist;
    expect(notifyConfig.android.apiKey).to.equal('xx');

    expect(notifyConfig.ios).to.exist;
    expect(notifyConfig.ios.cert).to.have.string('/server/xx/xx.pem');
    expect(notifyConfig.ios.production).to.be.true;

    // defaults are set
    expect(notifyConfig.settings).to.exist;
    expect(notifyConfig.settings.timeoutInSeconds).to.equal(3600);
    expect(notifyConfig.ios.badge).to.be.true;

    done();
  });

  it('Get default notifier.', function(done) {
    var deviceTypes = pushNotifier.deviceTypes;
    expect(deviceTypes).to.exist;

    sendNotification = pushNotifier.getSender(notifyConfig);
    expect(sendNotification).to.exist;
    
    done();
  });

  it('Get notifier from non-default android-only config.', function(done) {
    otherConfig = config.getConfig('notificationsOther');

    expect(otherConfig.android).to.exist;
    expect(otherConfig.android.apiKey).to.equal('xx');

    // defaults are not set for other config but can be specified
    expect(otherConfig.settings).to.exist;
    expect(otherConfig.settings.timeoutInSeconds).to.equal(60);

    var otherSendFunction = pushNotifier.getSender(otherConfig);
    expect(otherSendFunction).to.exist;

    done();
  });

  it('Send notification to unconfigured device type.', function(done) {
    var otherSendFunction = pushNotifier.getSender(otherConfig);
    expect(otherSendFunction).to.exist;

    otherSendFunction('fake_id', pushNotifier.deviceTypes.IOS, {
      message: 'test'
    }, function(err, data) {
      expect(err.message).to.have.string('Can\'t push to deviceType');
      done();
    });
  });

  it('Get notifier from empty config.', function(done) {
    var otherConfig = {};
    expect(pushNotifier.getSender.bind(pushNotifier, otherConfig)).to.throw(/non-empty object/);
    done();
  });

  it('Get notifier from invalid config.', function(done) {
    var otherConfig = {
      settings: {
        timeoutInSeconds: 60
      },
      android: {
        collapseKey: 'MyTestApp'
      },
      ios: {
        key: 'server/xx/xx.pem'
      }
    };
    expect(pushNotifier.getSender.bind(pushNotifier, otherConfig)).to.throw(/must contain at least/);
    done();
  });

  it('Attempts to send GCM push notification.', function(done) {
    sendNotification(deviceID, pushNotifier.deviceTypes.ANDROID, payload, function(err, data) {
      expect(err).to.not.exist;
      expect(data).to.be.empty;
      done();
    });
  });

  it('Attempts to send IOS push notification.', function(done) {
    sendNotification(deviceID, pushNotifier.deviceTypes.IOS, payload, function(err, data) {
      expect(err).to.not.exist;
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