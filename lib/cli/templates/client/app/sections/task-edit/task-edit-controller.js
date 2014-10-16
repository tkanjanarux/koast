'use strict';

angular.module('erg')

.controller('TaskEditCtrl', function($http, $log, tasks, $stateParams, router) {
    var scope = this;

    tasks.getTask($stateParams._id).then(function(response) {
        scope.task = response;
    }).then(null, $log.error);

    scope.cancel = router.goToTaskList;

    scope.updateTask = function(task) {
        tasks.updateTask($stateParams._id, task)
            .then(function() {
                router.goToTaskList();
            })
            .then(null, $log.error);
    }
});
