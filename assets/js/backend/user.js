angular.module('excavator.backend.user', []).

constant('backend.user.scope', 'admins').
constant('backend.user.token.name', 'admin.token').
constant('backend.user.enable.token.param', false).

constant('backend.user.auth.success.resolver', [
  'backend.user.login.status',
  'func.location.goto',
  function(
    status,
    goto
  ) {
    return status.update().then(function (loggedIn) {
      if (loggedIn) goto('/');
      return loggedIn;
    });
  }
]).

constant('backend.user.auth.needed.resolver', [
  'backend.user.login.status',
  'func.location.goto',
  function(
    status,
    goto
  ) {
    return status.update().then(function (loggedIn) {
      if (!loggedIn) goto('/login');
      return loggedIn;
    });
  }
]).

service('backend.user.user.token.set', [
  '$http',
  '$rootScope',
  'backend.user.token.name',
  'func.localstorage.load',
  'func.localstorage.save',
  function (
    $http,
    $rootScope,
    name,
    load,
    save
  ) {
    return function (token) {
      if (!token) token = load(name);
      if (token) {
        save(name, token);
        $http.defaults.headers.common.Authorization = 'token ' + token;
        $rootScope.$emit('request-login-status-update');
      }
    };
  }
]).

service('backend.user.user.token.unset', [
  '$http',
  '$rootScope',
  'backend.user.token.name',
  'func.localstorage.remove',
  function (
    $http,
    $rootScope,
    name,
    remove
  ) {
    return function () {
      remove(name);
      delete $http.defaults.headers.common.Authorization;
      $rootScope.$emit('request-login-status-update');
    };
  }
]).

service('backend.user.login.status', [
  '$http',
  '$rootScope',
  'backend.user.scope',
  'func.panic',
  function ($http, $rootScope, scope, panic) {
    var self = this;
    self.loggedIn = false;

    $rootScope.$watch(function () {
      return self.loggedIn;
    }, function (val) {
      if (!val) {
        self.username = undefined;
      }
      $rootScope.$broadcast('login-status-changed', val);
    });

    self.updatePromise = undefined;

    self.update = function () {
      if (angular.isUndefined(self.updatePromise)) {
        self.updatePromise = $http.get('/backend/' + scope + '/status').
        then(function (res) {
          self.loggedIn = !!(res.data.status && res.data.status === 'OK');
          self.username = res.data.username;
          return self.loggedIn;
        }, panic).finally(function () {
          self.updatePromise = undefined;
        });
      }
      return self.updatePromise;
    };
  }
]).

run([
  '$rootScope',
  '$location',
  'backend.user.enable.token.param',
  'backend.user.login.status',
  'backend.user.user.token.set',
  function ($rootScope, $location, tokenParamEnabled, status, set) {
    $rootScope.$on('request-login-status-update', status.update);
    if (tokenParamEnabled) {
      var token = $location.search().token;
      set(token);
      if (token) {
        $location.search('token', null);
      }
    } else {
      set();
    }
  }
]).

factory('backend.user.login', [
  '$http',
  'backend.user.scope',
  'backend.user.user.token.set',
  function ($http, scope, set) {
    return function (username, password) {
      return $http.post('/backend/' + scope + '/login', {
        username: username,
        password: password
      }).then(function (res) {
        var data = res.data;
        if (!data || !data.token) throw undefined;
        set(data.token);
        return res;
      });
    };
  }
]).

factory('backend.user.logout', [
  'backend.user.user.token.unset',
  'func.location.goto',
  function (unset, goto) {
    return function () {
      unset();
      goto('/login');
    };
  }
]);
