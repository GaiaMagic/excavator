angular.module('excavator.shared.subs', [
  'excavator.misc'
]).

controller('controller.shared.submission.list', [
  '$location',
  '$routeParams',
  '$scope',
  'func.array',
  'func.localstorage.load',
  'func.localstorage.save',
  'func.scheme.parse',
  'i18n.translate',
  'misc.statuses',
  'submissions',
  function (
    $location,
    $routeParams,
    $scope,
    funcArray,
    load,
    save,
    parse,
    tr,
    statuses,
    submissions
  ) {
    if (!angular.isArray(submissions)) return;
    var self = this;

    this.form = $routeParams.form;
    this.filter = function () {
      $location.search('form', this.form || null);
    };

    this.submissions = submissions;

    var scanned = {};
    var models = {};
    var LABELS = {};
    var labels = [];
    for (var i = 0; i < submissions.length; i++) {
      var rev = submissions[i].form_revision;
      if (scanned[rev._id]) continue;
      scanned[rev._id] = true;
      try {
        var parsed = parse(rev.content);
        if (!angular.isArray(parsed.scheme)) continue;
        for (var j = 0; j < parsed.scheme.length; j++) {
          if (angular.isArray(parsed.scheme[j].models)) {
            parsed.scheme[j].models.forEach(function (model) {
              models[model.label] = model.model;
              LABELS[model.model] = model.label;
              if (labels.indexOf(model.label) === -1) {
                labels.push(model.label);
              }
            });
            continue;
          }
          var model = parsed.scheme[j].model;
          if (model.slice(0, 12) === 'undetermined') continue;
          var label = parsed.scheme[j].label || model;
          models[label] = model;
          LABELS[model] = label;
          if (labels.indexOf(label) === -1) {
            labels.push(label);
          }
        }
      } catch (e) {}
    }

    var cols;
    try {
      cols = load('submissions.view.columns', angular.fromJson)
      if (!(cols instanceof Array)) throw 'not an array';
    } catch (e) {
      cols = undefined;
    }
    this.models = models;
    this.LABELS = LABELS;
    this.labels = cols || angular.copy(labels);
    this.reset = function () {
      this.labels = angular.copy(labels);
    };

    $scope.$watchCollection(function () {
      return self.labels;
    }, function (val) {
      save('submissions.view.columns', val);
    });

    this.array = funcArray;
    this.tr = tr;

    this.statuses = statuses;

    this.statusFilter = +$routeParams.status;
    if (isNaN(this.statusFilter)) this.statusFilter = undefined;
    $scope.$watch(function () {
      return self.statusFilter;
    }, function (val) {
      if (angular.isDefined(val) && !angular.isNumber(val)) return;
      $location.search('status', angular.isNumber(val) ? val : null);
    });
  }
]).

controller('controller.shared.submission.view', [
  '$injector',
  '$route',
  'backend.submission.status',
  'currentSubmission',
  'func.panic',
  'i18n.translate',
  'misc.statuses',
  'setStatusPrefix',
  function (
    $injector,
    $route,
    setStatus,
    currentSubmission,
    panic,
    tr,
    statuses,
    setStatusPrefix
  ) {
    if (!currentSubmission) {
      return panic('Submission is corrupted.');
    }

    this.sub = currentSubmission;

    this.isEmpty = function (object) {
      if (!angular.isObject(object)) return true;
      return Object.keys(object).length === 0;
    };

    this.statuses = statuses;
    this.tr = tr;

    this.setStatus = function (status) {
      setStatus(setStatusPrefix, currentSubmission.sub._id, status.id).
      then(function () {
        $route.reload();
      }, panic);
    };
  }
]);
