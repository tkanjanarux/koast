/** @module koast/pushNotifier */

'use strict';

var apn = require('./apn'),
    gcm = require('./gcm'),
    config = require('../config');

/**
 * Returns an object which exposes APN and GCM notification sending capability
 * through a single send() function, and an object enumerating the possible
 * device types accepted by send().
 *
 * @param  {String}   passedConfigFilename       Name of the notifications
 *                                               config file.
 * @return {Object}                              An object with possible device
 *                                               types and a send function.
 */
exports.getPushNotifier = function(passedConfigFilename) {
  var configFilename = passedConfigFilename || 'notifications';
  var notifierConfig = config.getConfig(configFilename);
  var apnSendNotification = apn.getSender(notifierConfig);
  var gcmSendNotification = gcm.getSender(notifierConfig);

  return {
    deviceTypes: {
      IOS: 'ios',
      ANDROID: 'android',
      WEB: 'web-simulation'
    },
    /**
     * Sends a message to a device identified by a deviceType and deviceID. A 
     * callback is provided to handle the result of sending a GCM notification.
     * APN notification events are logged as they are triggered.
     *
     * @param {String}    deviceID    A unique identifier for the device, either
     *                                an Android registration ID or an Apple
     *                                device token
     * @param {String}    deviceType  One of the possible deviceTypes
     * @param {Object}    message     Payload formatted for cordova PushPlugin
     *                                TODO: include fields
     * @param {Function}  callback    Handle error or result data, only useful
     *                                for GCM messages
     */
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