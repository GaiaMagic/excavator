angular.module('excavator.manager.subs', []).

controller('controller.manager.manager.submission.list', [
  '$scope',
  'func.array',
  'func.localstorage.load',
  'func.localstorage.save',
  'func.scheme.parse',
  'submissions',
  function (
    $scope,
    funcArray,
    load,
    save,
    parse,
    submissions
  ) {
    if (!angular.isArray(submissions)) return;
    var self = this;

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
  }
]).

controller('controller.manager.manager.submission.view', [
  'currentSubmission',
  function (currentSubmission) {
    if (!currentSubmission) return;

    this.sub = currentSubmission;
  }
]);
