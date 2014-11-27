angular.module('excavator.admin.login', []).

controller('controller.control.admin.login', [
  'backend.user.login',
  'func.location.goto',
  'func.panic',
  function (login, goto, panic) {
    this.login = function () {
      login(this.username, this.password).then(function (res) {
        goto('/');
      }).catch(panic);
    };
  }
]);
