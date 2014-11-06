angular.module('excavator', [
  'ngRoute',
  'excavator.admin',
  'excavator.backend',
  'excavator.func',
  'excavator.routes',
  'excavator.scheme',
  'excavator.vendor'
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
}]);
