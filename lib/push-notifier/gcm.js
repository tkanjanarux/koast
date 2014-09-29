'use strict';

var gcm = require('node-gcm'),
      _ = require('underscore');

// This is the Google Server API Key for the project.
var API_KEY = 'key from config';

var sender = new gcm.Sender(API_KEY);

var gcmManager = module.exports = {
  sendNotification: function(device, payload, cb) {
    // Format the payload to incude fields required by cordova PushPlugin on Android
    payload = _.omit(_.extend(payload.toJSON(), {
        title: "MyTestApp",
        message: payload["text"]
    }), ['__v', 'state']);

    var messageData = {
        // Collapse key for offline message grouping
        collapseKey: 'MyTestApp',
        // TTL in seconds if device offline
        timeToLive: 3600,
        // GCM payload parsed by PushPlugin
        data: payload
    };
    var alert = new gcm.Message(messageData);

    var registrationIds = [];
    registrationIds.push(device);

    sender.sendNoRetry(alert, registrationIds, function(err, result) {
        cb(err, result);
    });
  }
}
