/** @module koast/pushNotifier */

'use strict';

var apn = require('./apn'),
    gcm = require('./gcm'),
    config = require('../config');

/**
 * An object enumerating the possible device types accepted by the sender.
 */
var deviceTypes = exports.deviceTypes = {
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web-simulation'
}

/**
 * Returns an function which exposes APN and GCM push notification sending 
 * capability.
 *
 * @param  {String}   passedConfigFilename       Name of the notifications
 *                                               config file.
 * @return {Function} A function you can use to send an APN or GCM push
 *                    notification.
 */
exports.getSender = function(passedConfigFilename) {
  var configFilename = passedConfigFilename || 'notifications';
  var notifierConfig = config.getConfig(configFilename);
  var apnSendNotification = apn.getSender(notifierConfig);
  var gcmSendNotification = gcm.getSender(notifierConfig);

  /**
   * Sends a message to a device identified by a deviceType and deviceID. A 
   * callback is provided to handle the result of sending the notification.
   * APN notification events are automatically logged as they are triggered.
   *
   * @param {String}    deviceID    A unique identifier for the device, either
   *                                an Android registration ID or an Apple
   *                                device token
   * @param {String}    deviceType  One of the possible deviceTypes
   * @param {Object}    message     Payload formatted for cordova PushPlugin
   *                                TODO: include fields
   * @param {Function}  callback    Handle error or result data
   */
  return function send(deviceID, deviceType, message, callback) {
    if (deviceType === deviceTypes.IOS) {
      apnSendNotification(deviceID, message, function(err, data) {
        return callback(err, data);
      });
    } else if (deviceType === deviceTypes.ANDROID) {
      gcmSendNotification(deviceID, message, function(err, data) {
        return callback(err, data);
      });
    } else {
      return callback(new Error("Can't push to deviceType: " + deviceType + " with deviceID: " + deviceID));
    }
  }
}