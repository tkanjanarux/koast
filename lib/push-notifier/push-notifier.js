'use strict';

var apn = require('./apn'),
    gcm = require('./gcm'),
    config = require('../config');

exports.getPushNotifier = function(passedConfigFilename) {
  var configFilename = passedConfigFilename || 'notifications';
  var notifierConfig = config.getConfig(configFilename, true);
  var apnSendNotification = apn.getSender(notifierConfig);
  var gcmSendNotification = gcm.getSender(notifierConfig);

  return {
    deviceTypes: {
      IOS: 'ios',
      ANDROID: 'android',
      WEB: 'web-simulation'
    },
    send: function(deviceID, deviceType, message, callback) {
      if (deviceType === deviceTypes.IOS) {
        apnSendNotification(deviceID, message, function(err, data) {
          callback(err, data);
        });
      } else if (deviceType === deviceTypes.ANDROID) {
        gcmSendNotification(deviceID, message, function(err, data) {
          callback(err, data);
        });
      } else {
        callback(new Error("Can't push to deviceType: " + deviceType + " with deviceID: " + deviceID));
      }
    }
  }
}