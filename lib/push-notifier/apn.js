'use strict';

var apn = require('apn'),
      _ = require('underscore');

function addEventHandlers(connection) {
  connection.on('connected', function() {
    console.log("Connected to APNs");
  });

  connection.on('timeout', function () {
    console.log("Connection Timeout");
  });

  connection.on('disconnected', function() {
    console.log("Disconnected from APNs");
  });

  connection.on('transmitted', function(notification, device) {
    console.log("Notification transmitted to:", device.token.toString('hex'));
  });

  connection.on('cacheTooSmall', function(sizeDifference) {
    console.log("Cache too small, approximately", sizeDifference, "APN notifications will be lost");
  });

  connection.on('error', console.error);

  connection.on('transmissionError', function(errCode, notification, device) {
    console.error("Notification caused error:", errCode, "for device", device, notification);
  });

  connection.on('socketError', console.error);
}

exports.getSender = function(config) {
  var options = config.ios;
  var apnConn = new apn.Connection(options);

  addEventHandlers(apnConn);

  return function(deviceToken, payload, callback) {
    var device = new apn.Device(deviceToken);
    var alert = new apn.Notification();

    alert.expiry = Math.floor(Date.now() / 1000) + config.settings.timeoutInSeconds;
    alert.badge = 1;
    alert.alert = payload['text'];
    alert.payload = _.omit(payload.toJSON(), ['__v', 'state']);

    apnConn.pushNotification(alert, device);
    console.log('Pushed APN notification');

    // APN response comes via events on the APN connection
    callback(null, {});
  }
}
