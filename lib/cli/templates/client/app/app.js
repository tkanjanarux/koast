
angular.module('app', [
  'koast'
])

.run(function ($log, koast) {

  koast.init({
    baseUrl: 'http://localhost:3000'
  });
  koast.setApiUriPrefix('/api');
  koast.addEndpoint(
    //Put your endpoint here
  );
});
