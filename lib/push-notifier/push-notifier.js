/** @module koast/pushNotifier */

'use strict';

var _ = require('underscore');
var apn = require('./apn');
var gcm = require('./gcm');

/**
 * An object enumerating the possible device types accepted by the send 
 * function.
 */
var deviceTypes = exports.deviceTypes = {
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web-simulation'
};

/**
 * Returns the send function which exposes APN and GCM push notification 
 * capability.
 *
 * @param  {String}   passedConfig    The notifications config object
 * @return {Function} The {@linkcode send} function which exposes APN and GCM 
 *                    push notification capability
 */
exports.getSender = function(passedConfig) {
  if (!_.isObject(passedConfig) || _.isEmpty(passedConfig)) {
    throw new Error('Config must be a non-empty object');
  }

  if (!(passedConfig.android && passedConfig.android.apiKey) && 
      !(passedConfig.ios && passedConfig.ios.cert && passedConfig.ios.key)) {
    throw new Error('Config must contain at least android.apiKey or a ' +
      'combination of both ios.cert and ios.key');
  }

  var notifierConfig = passedConfig;
  var apnSendNotification = apn.getSender(notifierConfig);
  var gcmSendNotification = gcm.getSender(notifierConfig);

  /**
   * Sends a message to a device identified by a deviceType and deviceID. A 
   * callback is provided to handle the result of sending the notification.
   * APN notification events are automatically logged as they are triggered.
   * This function is returned by getSender().
   *
   * @param {String}  deviceID    A unique identifier for the device, either
   *                              an Android registration ID or an Apple
   *                              device token
   * @param {String}  deviceType  One of the possible deviceTypes
   * @param {Object}  message     Payload formatted for cordova PushPlugin,
   *                              also allows custom properties to be attached
   * @param {String}  message.title   Title of notification on Android (required)
   * @param {String}  message.message Notification alert text (required)
   * @param {Function}  callback  Handle error or result data
   * @function send
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
      return callback(new Error('Can\'t push to deviceType: ' + deviceType + 
        ' with deviceID: ' + deviceID));
    }
  };
};