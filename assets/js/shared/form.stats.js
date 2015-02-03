angular.module('excavator.shared.form', []).

controller('controller.shared.form.stats', [
  'i18n.translate',
  'form',
  'func.localstorage.load',
  'func.localstorage.save',
  function (
    tr,
    form,
    load,
    save
  ) {
    if (!angular.isObject(form)) return;
    this.form = form;
    this.tr = tr;

    this.formStatsScheme = 'schemeSorted';
    if (load('form.stats.sorted') === 'no') {
      this.formStatsScheme = 'scheme';
    }
    this.formStatsPercentage = true;
    if (load('form.stats.percentage') === 'no') {
      this.formStatsPercentage = false;
    }
    this.toggleFormStatsSchemeSorted = function () {
      var sorted = false;
      if (this.formStatsScheme === 'scheme') {
        this.formStatsScheme = 'schemeSorted';
        sorted = true;
      } else {
        this.formStatsScheme = 'scheme';
      }
      save('form.stats.sorted', sorted ? 'yes' : 'no');
    };
    this.toggleFormStatsPercentage = function () {
      this.formStatsPercentage = !this.formStatsPercentage;
      save('form.stats.percentage', this.formStatsPercentage ? 'yes' : 'no');
    };

    var stats = form.stats || {};
    if (stats.scheme) {
      var schemeStats = stats.scheme;
      var total = stats.count;
      schemeStats.forEach(function (scheme) {
        scheme.enums.forEach(function (e) {
          e.percent = (e.count / total * 100).toFixed(2) + '%';
        });
      });
      stats.schemeSorted = angular.copy(stats.scheme);
      stats.schemeSorted.forEach(function (scheme) {
        scheme.enums.sort(function (a, b) {
          return b.count - a.count;
        });
      });
    }
  }
]);
