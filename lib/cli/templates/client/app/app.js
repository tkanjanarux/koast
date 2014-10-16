angular.module('erg', [
  'erg.main-ctrl',
  'erg.tasks',
  'erg.router',
  'koast'
])

.run(function ($log, koast) {

  koast.init({
    baseUrl: 'http://localhost:8080'
  });
  koast.setApiUriPrefix('/api/v1/');
  koast.addEndpoint('tasks-plus', ':taskId', {
    useEnvelope: true
  });
});
