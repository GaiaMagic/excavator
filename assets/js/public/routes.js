angular.module('excavator.public.routes', [
  'excavator.resolver.form'
]).

config([
  '$routeProvider', '$locationProvider', 'resolver.form',
  function($routeProvider, $locationProvider, formResolver) {
    $routeProvider.

    when('/', {
      templateUrl: '/public/index.html'
    }).

    when('/:formid/:formrevid?', {
      templateUrl: '/public/form.html',
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
