'use strict';

var gcm = require('node-gcm'),
      _ = require('underscore');

exports.getSender = function(config) {
  // Create a sender using your Google Server API Key 
  var sender = new gcm.Sender(config.android.apiKey);

  return function(device, payload, callback) {
    // Format the payload to include fields required by cordova PushPlugin on Android
    payload = _.omit(_.extend(payload.toJSON(), {
        title: "MyTestApp",
        message: payload["text"]
    }), ['__v', 'state']);

    var messageData = {
        // Collapse key for offline message grouping
        collapseKey: 'MyTestApp',
        // TTL in seconds if device offline
        timeToLive: config.settings.timeoutInSeconds,
        // GCM payload parsed by PushPlugin
        data: payload
    };
    var alert = new gcm.Message(messageData);

    var registrationIds = [];
    registrationIds.push(device);

    sender.sendNoRetry(alert, registrationIds, function(err, result) {
        callback(err, result);
    });    
  }
}
