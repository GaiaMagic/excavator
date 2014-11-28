angular.module('excavator.public.form', [
  'mgcrea.ngStrap.modal',
  'excavator.func.enumerate',
  'excavator.func.error',
  'excavator.func.filter',
  'excavator.func.panic',
  'excavator.func.scheme',
  'excavator.scheme'
]).

directive('scrollTo', [
  function () {
    function easing (x) {
      if (x < 0.5) {
        return Math.pow(x * 2, 2) / 2;
      }
      return 1 - Math.pow((1 - x) * 2, 2) / 2;
    }

    function animateScroll (start, init, delta, duration, callback) {
      if (!start) {
        start = new Date().getTime();
      }
      var elapsed = new Date().getTime() - start;
      var percent = elapsed >= duration ? 1 : easing(elapsed / duration);
      if (init < delta) {
        window.scrollTo(0, init + (delta - init) * percent);
      } else {
        window.scrollTo(0, delta + init * (1 - percent));
      }
      if (percent === 1) {
        if (typeof callback === 'function') {
          callback();
        }
        return;
      }
      var args = arguments;
      setTimeout(function () {
        animateScroll.apply(undefined, args);
      }, 3);
    }

    function scrollTop () {
      return filterResults(
        window.pageYOffset ? window.pageYOffset : 0,
        document.documentElement ? document.documentElement.scrollTop : 0,
        document.body ? document.body.scrollTop : 0
      );
    }

    function filterResults (win, docel, body) {
      var ret = win ? win : 0;
      if (docel && (!ret || (ret > docel))) {
        ret = docel;
      }
      return body && (!ret || (ret > body)) ? body : ret;
    }

    return {
      link: function ($scope, $element, $attrs) {
        $element.on('click', function () {
          var elem = document.getElementById($attrs.scrollTo);
          if (elem) {
            animateScroll(undefined, scrollTop(), elem.offsetTop, 200);
          }
        });
      }
    };
  }
]).

controller('controller.public.form', [
  '$q',
  '$scope',
  '$window',
  'func.panic',
  'func.panic.alert',
  'currentForm',
  'i18n.translate',
  'public.public.forms.submit',
  'scheme.bulk.enable.submit.buttons',
  function (
    $q,
    $scope,
    $window,
    panic,
    alert,
    currentForm,
    tr,
    submitForm,
    enableSubmitButtons
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
      var enable = enableSubmitButtons(schemes, false);

      var data = this.form.content.data;
      var revid = currentForm.form.head._id;
      submitForm(revid, data).then(function () {
        self.truncate();
        alert(tr('forms::Thank you.'), tr('forms::Success'), function () {
          $window.location.reload();
        });
      }, panic).finally(function () {
        if (!enable.cancel()) {
          enableSubmitButtons(schemes, true);
        }
      });
    };
  }
]);
