angular.module('excavator.manager.login', []).

controller('controller.manager.manager.login', [
  'backend.user.login',
  'func.location.goto',
  'func.panic',
  function (login, goto, panic) {
    this.username = 'newyork';
    this.password = '123456';
    this.login = function () {
      login(this.username, this.password).then(function (res) {
        goto('/');
      }).catch(panic);
    };
  }
]);
