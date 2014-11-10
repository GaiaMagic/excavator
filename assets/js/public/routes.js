angular.module('excavator.public.routes', [
  'excavator.resolver'
]).

config([
  '$routeProvider', '$locationProvider', 'resolver.form',
  function($routeProvider, $locationProvider, formResolver) {
    $routeProvider.

    when('/', {
      templateUrl: '/public/index.html'
    }).

    when('/:formid', {
      templateUrl: '/public/form.html',
      controller: 'FormController as form',
      resolve: {
        currentForm: formResolver('public.public.forms')
      }
    }).

    otherwise({
      redirectTo: '/'
    });

    $locationProvider.html5Mode(true);
  }
]);
