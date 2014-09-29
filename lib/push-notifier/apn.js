'use strict';

var apn = require('apn'),
      _ = require('underscore');

// replace with config options
var options = {
  cert: 'path from config',
  key: 'path from config'
};

var expiryInSeconds = 3600; // 1 hour

var apnConn = new apn.Connection(options);

apnConn.on('connected', function() {
  console.log("Connected to APNs");
});

apnConn.on('timeout', function () {
  console.log("Connection Timeout");
});

apnConn.on('disconnected', function() {
  console.log("Disconnected from APNs");
});

apnConn.on('transmitted', function(notification, device) {
  console.log("Notification transmitted to:", device.token.toString('hex'));
});

apnConn.on('cacheTooSmall', function(sizeDifference) {
  console.log("Cache too small, approximately", sizeDifference, "APN notifications will be lost");
});

apnConn.on('error', console.error);

apnConn.on('transmissionError', function(errCode, notification, device) {
  console.error("Notification caused error:", errCode, "for device", device, notification);
});

apnConn.on('socketError', console.error);

var apnManager = module.exports = {
  sendNotification: function(deviceToken, payload, cb) {
    var device = new apn.Device(deviceToken);
    var alert = new apn.Notification();

    alert.expiry = Math.floor(Date.now() / 1000) + expiryInSeconds;
    alert.badge = 1;
    alert.alert = payload['text'];
    alert.payload = _.omit(payload.toJSON(), ['__v', 'state']);

    apnConn.pushNotification(alert, device);
    console.log('sent');

    // APN response comes via events handled above
    cb(null, {});
  }
}