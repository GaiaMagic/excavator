angular.module('excavator.public.form', [
  'mgcrea.ngStrap.modal',
  'excavator.func.enumerate',
  'excavator.func.error',
  'excavator.func.panic',
  'excavator.func.scheme',
  'excavator.scheme'
]).

controller('controller.public.form', [
  'func.panic',
  'func.panic.alert',
  'currentForm',
  'public.public.forms.submit',
  function (panic, alert, currentForm, submitForm) {
    if (angular.isUndefined(currentForm)) {
      return;
    } else if (currentForm === false) {
      return panic('Form is corrupted.');
    } else {
      this.form = currentForm;
    }

    this.form = currentForm;
    this.form.content.data = {};

    this.submit = function () {
      var revid = currentForm.form.head._id;
      submitForm(revid, this.form.content.data).then(function () {
        alert('Thank you.', 'OK');
      }, panic);
    };
  }
]);
