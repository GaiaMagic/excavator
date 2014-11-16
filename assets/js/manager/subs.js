angular.module('excavator.manager.subs', []).

controller('controller.manager.manager.submission.list', [
  '$scope',
  'func.array',
  'func.localstorage.load',
  'func.localstorage.save',
  'submissions',
  function (
    $scope,
    funcArray,
    load,
    save,
    submissions
  ) {
    if (!angular.isArray(submissions)) return;
    var self = this;

    this.submissions = submissions;

    var models = [];
    for (var i = 0; i < submissions.length; i++) {
      var keys = Object.keys(submissions[i].data);
      for (var j = 0; j < keys.length; j++) {
        if (models.indexOf(keys[j]) === -1) models.push(keys[j]);
      }
    }
    var cols;
    try {
      cols = load('submissions.view.columns', angular.fromJson)
      if (!(cols instanceof Array)) throw 'not an array';
    } catch (e) {
      cols = undefined;
    }
    this.models = cols || angular.copy(models);
    this.reset = function () {
      this.models = angular.copy(models);
    };

    $scope.$watchCollection(function () {
      return self.models;
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
