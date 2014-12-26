angular.module('excavator.public.form', [
  'mgcrea.ngStrap.modal',
  'excavator.func.enumerate',
  'excavator.func.error',
  'excavator.func.panic',
  'excavator.func.scheme',
  'excavator.public.container',
  'excavator.scheme',
  'excavator.shared.scroll',
  'excavator.shared.validator'
]).

controller('controller.public.form', [
  '$timeout',
  '$window',
  'func.panic',
  'func.panic.alert',
  'currentForm',
  'file.manager',
  'i18n.translate',
  'public.public.forms.submit',
  'scheme.bulk.enable.submit.buttons',
  'shared.scroll.to.first.element',
  'shared.validator',
  function (
    $timeout,
    $window,
    panic,
    alert,
    currentForm,
    fileMan,
    tr,
    submitForm,
    enableSubmitButtons,
    scrollTo,
    validator
  ) {
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
      var schemes = currentForm.content.scheme;
      var data = currentForm.content.data;

      var errorCount = validator.validate(schemes, data);
      if  (errorCount !== 0) {
        $timeout(function () {
          scrollTo('.has-error', true);
        });
        return;
      }

      var enable = enableSubmitButtons(schemes, false);

      var revid = currentForm.form.head._id;
      submitForm(revid, data).then(function () {
        self.truncate();

        var tpl = currentForm.form.head.template;
        var successDialog;
        if (tpl) {
          var dialog = fileMan.findFileByName(tpl, 'success-dialog');
          if (dialog.content) {
            successDialog = dialog.content;
          }
        }

        alert(tr('forms::Thank you.'), tr('forms::Success'), function () {
          $window.location.reload();
        }, successDialog);

        alert(tr('forms::Thank you.'), tr('forms::Success'), function () {
          $window.location.reload();
        }, successDialog);
      }, panic).finally(function () {
        if (!enable.cancel()) {
          enableSubmitButtons(schemes, true);
        }
      });
    };
  }
]);
