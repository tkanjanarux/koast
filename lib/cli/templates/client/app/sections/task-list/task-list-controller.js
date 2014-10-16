'use strict';

angular.module('erg')

.controller('TaskListCtrl', function($log, tasks, router) {
    var scope = this;
    scope.tasks = [];

    scope.addTask = router.goToAddTask;

    tasks.getTasks()
        .then(function(tasks) {
            scope.tasks = tasks;
        })
        .then(null, $log.error);
});
