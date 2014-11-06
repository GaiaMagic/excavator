angular.module('excavator.backend.admin', []).

service('backend.admin.user.token.set', [
  '$http',
  '$rootScope',
  'func.localstorage.load',
  'func.localstorage.save',
  function ($http, $rootScope, load, save) {
    return function (token) {
      if (!token) token = load('usertoken');
      if (token) {
        save('usertoken', token);
        $http.defaults.headers.common.Authorization = 'token ' + token;
        $rootScope.$emit('request-login-status-update');
      }
    };
  }
]).

service('backend.admin.user.token.unset', [
  '$http',
  '$rootScope',
  'func.localstorage.remove',
  function ($http, $rootScope, remove) {
    return function () {
      remove('usertoken');
      delete $http.defaults.headers.common.Authorization;
      $rootScope.$emit('request-login-status-update');
    };
  }
]).

service('backend.admin.login.status', [
  '$http',
  '$rootScope',
  'func.panic',
  function ($http, $rootScope, panic) {
    var self = this;
    self.loggedIn = false;

    $rootScope.$watch(function () {
      return self.loggedIn;
    }, function (val) {
      $rootScope.$broadcast('login-status-changed', val);
    });

    self.updatePromise = undefined;

    self.update = function () {
      if (angular.isUndefined(self.updatePromise)) {
        self.updatePromise = $http.get('/admins/status').then(function (res) {
          self.loggedIn = !!(res.data.status && res.data.status === 'OK');
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
  'backend.admin.login.status',
  'backend.admin.user.token.set',
  function ($rootScope, status, set) {
    $rootScope.$on('request-login-status-update', status.update);
    set();
  }
]).

factory('backend.admin.login', [
  '$http',
  'backend.admin.user.token.set',
  function ($http, set) {
    return function (username, password) {
      return $http.post('/admins/login', {
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

factory('backend.admin.logout', [
  'backend.admin.user.token.unset',
  'func.location.goto',
  function (unset, goto) {
    return function () {
      unset();
      goto('/');
    };
  }
]);
