angular.module('app', [
  'koast'
])

.run(function ($log, koast) {

  koast.init({
    baseUrl: 'http://localhost:8080'
  });
  koast.setApiUriPrefix('/api/v1/');
  koast.addEndpoint(
    //Put your endpoint here
  );
});
