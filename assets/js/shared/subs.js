angular.module('excavator.shared.subs', [
  'excavator.shared.subs.value',
  'excavator.misc'
]).

controller('controller.shared.submission.list', [
  '$location',
  '$routeParams',
  '$scope',
  'i18n.translate',
  'misc.statuses',
  'submissions',
  function (
    $location,
    $routeParams,
    $scope,
    tr,
    statuses,
    submissions
  ) {
    if (!angular.isArray(submissions)) return;
    var self = this;

    this.submissions = submissions;

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
  'shared.domains',
  function (
    $injector,
    $route,
    setStatus,
    currentSubmission,
    panic,
    tr,
    statuses,
    setStatusPrefix,
    domains
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
    this.domains = domains;

    this.setStatus = function (status) {
      setStatus(setStatusPrefix, currentSubmission.sub._id, status.id).
      then(function () {
        $route.reload();
      }, panic);
    };
  }
]);
