angular.module('excavator', [
  'ngRoute',
  'excavator.admin',
  'excavator.func',
  'excavator.scheme'
]).

constant('data.admin.nav.menu', [{
  text: 'Create',
  link: '/create'
}, {
  text: 'Edit',
  link: '/edit'
}, {
  text: 'Manage',
  link: '/manage'
}]).

config([
  '$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.

    when('/edit', {
      templateUrl: '/edit.html',
      controller: 'AdminEditController as aec',
    }).

    otherwise({
      redirectTo: '/edit'
    });

    $locationProvider.html5Mode(true);
  }
]);
