'use strict';

var apn = require('./apn'),
    gcm = require('./gcm'),
    k = require('../constants');

var pushNotifier = module.exports = {
  deviceTypes: {
    IOS: 'ios',
    ANDROID: 'android',
    WEB: 'web-simulation'
  },
  send: function(deviceID, deviceType, message, callback) {
    if (deviceType && deviceType === k.deviceTypes.IOS) {
      apn.sendNotification(deviceID, message, function(err, data) {
        callback(err, data);
      });

    } else if (deviceType && deviceType === k.deviceTypes.ANDROID) {
      gcm.sendNotification(deviceID, message, function(err, data) {
        callback(err, data);
      });
    } else {
      console.log("Not pushing to deviceType: " + deviceType + ", deviceID: " + deviceID);
    }
  }
}