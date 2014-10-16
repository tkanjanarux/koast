'use strict';
/*global angular, _ */
angular.module('erg.tasks', [
    'erg.server',
    'koast'
  ])
  .factory('tasks', function (server, koast) {
    var service = {};

    function setMetaData(response) {
      var tasks = _.map(response, function (task) {

        task.can = {
          edit: task.owner === koast.user.data.username
        };

        return task;
      });

      return tasks;
    }

    service.getTasks = function () {

      return koast.user.whenAuthenticated().then(function () {
        return koast.queryForResources('tasks-plus');
      });

    };

    service.addTask = function (task) {
      return koast.user.whenAuthenticated()
        .then(function () {
          return server.post('/api/v1/tasks', task);
        });
    };

    service.updateTask = function (id, task) {
      return koast.user.whenAuthenticated()
        .then(function () {
          return server.put('/api/v1/tasks', id, {
            owner: task.owner,
            description: task.description
          });
        });
    };

    service.getTask = function (id) {
      return koast.user.whenAuthenticated()
        .then(function () {
          return server.get('/api/v1/tasks/' + id).then(function (
            response) {
            return setMetaData(response)[0];
          });

        });
    };


    return service;
  });
