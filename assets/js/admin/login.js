angular.module('excavator.admin.login', []).

controller('AdminLoginController', [
  'backend.admin.login',
  'func.location.goto',
  'func.panic',
  function (login, goto, panic) {
    this.username = 'caiguanhao';
    this.password = '123456';
    this.login = function () {
      login(this.username, this.password).then(function (res) {
        goto('/');
      }).catch(panic);
    };
  }
]);
