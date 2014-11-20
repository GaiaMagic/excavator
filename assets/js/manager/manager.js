angular.module('excavator.manager.manager', [
  'angular-loading-bar',
  'ngRoute',
  'mgcrea.ngStrap.modal',
  'excavator.backend.manager',
  'excavator.backend.submission',
  'excavator.backend.user',
  'excavator.func.array',
  'excavator.func.localstorage',
  'excavator.func.location',
  'excavator.func.panic',
  'excavator.func.scheme',
  'excavator.manager.login',
  'excavator.manager.nav',
  'excavator.manager.routes',
  'excavator.shared.subs'
]).

constant('backend.user.scope', 'managers').
constant('backend.user.token.name', 'manager.token').
constant('backend.user.enable.token.param', true);
