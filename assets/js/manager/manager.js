angular.module('excavator.manager.manager', [
  'ngRoute',
  'mgcrea.ngStrap.modal',
  'excavator.backend.user',
  'excavator.func.localstorage',
  'excavator.func.location',
  'excavator.func.panic',
  'excavator.manager.login',
  'excavator.manager.nav',
  'excavator.manager.routes'
]).

constant('backend.user.scope', 'managers').
constant('backend.user.token.name', 'manager.token').
constant('backend.user.login.entry', '/manager/login');
