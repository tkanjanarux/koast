'use strict';

angular.module('erg.main-ctrl', [
  'koast'
])

.controller('MainCtrl', function($log, koast) {
  var scope = this;
  scope.user = koast.user;
  scope.login = function(form) {
    koast.user.loginLocal(form)
      .then(function(response) {
        $log.info('response:', response);
        $log.info('koast:', koast.user);
      })
      .then(null, $log.error);
  };
  scope.logout = function() {
    koast.user.logout()
      .then(null, $log.error);
  };
});
