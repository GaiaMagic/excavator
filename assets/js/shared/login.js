angular.module('excavator.shared.login', []).

controller('controller.shared.user.login', [
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
]).

controller('controller.shared.user.passwd', [
  'backend.user.login.status',
  'backend.user.passwd',
  'backend.user.user.token.set',
  'func.location.goto',
  'func.panic',
  'func.panic.confirm',
  'i18n.translate',
  function (status, passwd, setToken, goto, panic, confirm, tr) {
    this.username = status.username;
    this.updatable = function () {
      return this.password && this.newpassword &&
        this.newpassword === this.newpassword2;
    };
    var self = this;
    this.passwd = function () {
      passwd(this.password, this.newpassword).then(function (res) {
        var token = res.data.token;
        confirm(tr('login::Password has been updated. ' +
          'Would you like to log in again?'),
          undefined,
          { class: 'btn-primary',
            text: tr('login::Yes, bring me to log in page') },
          { text: tr('login::No, keep me logged in') }
        ).then(function () {
          goto('/login');
        }).catch(function () {
          setToken(token);
        });
      }).catch(panic).finally(function () {
        self.password = undefined;
        self.newpassword = undefined;
        self.newpassword2 = undefined;
      });
    };
  }
]);
