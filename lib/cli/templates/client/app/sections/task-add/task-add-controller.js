'use strict';

angular.module('erg')

.controller('TaskAddCtrl', function($log, tasks, router) {
    var scope = this;

    scope.cancel = router.goToTaskList;

    scope.save = function(task) {

        tasks.addTask(task).then(function() {
            router.goToTaskList();
        }).then(null, $log.error);
    }

});
