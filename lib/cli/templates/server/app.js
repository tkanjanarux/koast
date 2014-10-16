'use strict';

var koast = require('koast');

koast.configure()
  .then(function (config) {
    console.log('This is your configuration: ', config);
  });

koast.serve();
