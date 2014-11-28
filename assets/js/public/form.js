angular.module('excavator.public.form', [
  'mgcrea.ngStrap.modal',
  'excavator.func.enumerate',
  'excavator.func.error',
  'excavator.func.panic',
  'excavator.func.scheme',
  'excavator.scheme'
]).

controller('controller.public.form', [
  '$window',
  'func.panic',
  'func.panic.alert',
  'currentForm',
  'i18n.translate',
  'public.public.forms.submit',
  function ($window, panic, alert, currentForm, tr, submitForm) {
    var self = this;

    if (angular.isUndefined(currentForm)) {
      return;
    } else if (currentForm === false) {
      return panic(tr('forms::Form is corrupted.'));
    } else {
      this.form = currentForm;
    }

    this.truncate = function () {
      this.form.content.data = this.form.content.data || {};
      var data = this.form.content.data;
      for (var key in data) {
        delete data[key];
      }
    };

    this.form = currentForm;
    this.truncate();

    this.submit = function () {
      var revid = currentForm.form.head._id;
      submitForm(revid, this.form.content.data).then(function () {
        self.truncate();
        alert(tr('forms::Thank you.'), tr('forms::Success'), function () {
          $window.location.reload();
        });
      }, panic);
    };
  }
]);
