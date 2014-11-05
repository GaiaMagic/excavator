angular.module('excavator.backend.admin', []).

service('backend.admin.loggedIn', [
  'func.localstorage.has',
  function (has) {
    this.loggedIn = function () {
      return has('usertoken');
    };
  }
]).

factory('backend.admin.login', [
  '$http',
  'func.localstorage.save',
  function ($http, save) {
    return function (username, password) {
      return $http.post('/admins/login', {
        username: username,
        password: password
      }).then(function (res) {
        var data = res.data;
        if (!data || !data.token) throw undefined;
        var token = data.token;
        save('usertoken', token);
        return res;
      });
    };
  }
]).

factory('backend.admin.logout', [
  'func.localstorage.remove',
  'func.location.goto',
  function (remove, goto) {
    return function () {
      remove('usertoken');
      goto('/');
    };
  }
]);
