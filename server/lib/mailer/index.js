'use strict';

var nodemailer = require("nodemailer"),
    _ = require('underscore'),
    config = require('../config');

exports.mailerMaker = function(passedConfigFilename) {
  var configFilename = passedConfigFilename || 'mailer';

  var mailerConfig = config.getConfig(configFilename, true),
  smtp;

  if (mailerConfig) {
    smtp = nodemailer.createTransport('SMTP', mailerConfig.smtp);  
  }

 return {
    sendMail: function(mailObj, cb) {
      smtp.sendMail(mailObj, cb);
    },
    smtp: smtp,
    initEmail: function(options) {
      mailerConfig = config.getConfig(configFilename, true);
      return _.extend(mailerConfig.email, options);
    }
  };
};