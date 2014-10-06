'use strict';

var gcm = require('node-gcm');

exports.getSender = function(config) {
  var options = config.android;
  // Create a sender using your Google Server API Key 
  var sender = new gcm.Sender(options.apiKey);

  return function(device, payload, callback) {
    // payload MUST include title and message fields when using cordova PushPlugin on Android 
    if (!payload || !payload.message || !payload.title) {
      return callback(new Error("GCM payload must include title and message fields"));
    } else if (device === 'mock') {
      return callback(null, {});
    }

    var messageData = {
      // TTL in seconds if device offline
      timeToLive: config.settings.timeoutInSeconds,
      // GCM payload parsed by PushPlugin
      data: payload
    };

    if (options.collapseKey) {
      // Collapse key for offline message grouping
      messageData['collapseKey'] = options.collapseKey;
    }

    var alert = new gcm.Message(messageData);

    var registrationIds = [];
    registrationIds.push(device);

    sender.sendNoRetry(alert, registrationIds, function(err, result) {
      return callback(err, result);
    });    
  }
}
