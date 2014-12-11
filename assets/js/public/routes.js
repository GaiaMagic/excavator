angular.module('excavator.public.routes', [
  'excavator.resolver.form'
]).

config([
  '$routeProvider', '$locationProvider', 'resolver.form',
  function($routeProvider, $locationProvider, formResolver) {
    $routeProvider.

    when('/', {
      templateUrl: '/nothing.html'
    }).

    when('/:formid/:formrevid?', {
      template: '<container></container>',
      controller: 'controller.public.form as cpf',
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
