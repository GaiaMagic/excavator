angular.module('excavator.shared.scroll', []).

// this function comes from angular-scroll
service('shared.scroll', [
  '$window',
  function ($window) {
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
        $window.scrollTo(0, init + (delta - init) * percent);
      } else {
        $window.scrollTo(0, delta + init * (1 - percent));
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
        $window.pageYOffset ? $window.pageYOffset : 0,
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

    this.animateScroll = animateScroll;
    this.scrollTop = scrollTop;
  }
]).

factory('shared.scroll.to.first.element', [
  '$document',
  'shared.scroll',
  function ($document, scroll) {
    return function (selector, focusInput) {
      var elems = $document[0].querySelectorAll(selector);
      if (elems.length > 0) {
        var elem = elems[0];
        var top = elem.getBoundingClientRect().top;
        top -= $document[0].body.getBoundingClientRect().top;
        top -= 15; // offset
        top = Math.max(0, top);
        scroll.animateScroll(undefined, scroll.scrollTop(), top, 200, function () {
          if (focusInput) {
            var input = elem.querySelector('input, textarea, select');
            if (input) {
              input.focus();
            }
          }
        });
      }
    };
  }
]).

directive('scrollTo', [
  'shared.scroll',
  function (scroll) {
    return {
      link: function ($scope, $element, $attrs) {
        $element.on('click', function () {
          var elem = document.getElementById($attrs.scrollTo);
          if (elem) {
            scroll.animateScroll(undefined, scroll.scrollTop(), elem.offsetTop, 200);
          }
        });
      }
    };
  }
]);
