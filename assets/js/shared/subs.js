angular.module('excavator.shared.subs', [
  'excavator.shared.subs.value'
]).

controller('controller.shared.submission.list', [
  '$location',
  '$route',
  '$routeParams',
  '$scope',
  'func.localstorage.load',
  'func.localstorage.save',
  'i18n.translate',
  'misc.ip',
  'misc.statuses',
  'submissions',
  function (
    $location,
    $route,
    $routeParams,
    $scope,
    load,
    save,
    tr,
    ip,
    statuses,
    submissions
  ) {
    if (!angular.isArray(submissions)) return;
    var self = this;

    this.submissions = submissions;

    this.showIpInfo = true;
    if (load('submissions.view.showIpInfo') === 'no') {
      this.showIpInfo = false;
    }
    this.toggleShowIpInfo = function () {
      this.showIpInfo = !this.showIpInfo;
      save('submissions.view.showIpInfo', this.showIpInfo ? 'yes' : 'no');
      $route.reload();
    };

    if (angular.isArray(submissions) && this.showIpInfo) {
      var ipAddrs = submissions.map(function (sub) {
        return sub.ip_address;
      });
      ip(ipAddrs).then(function (ipInfo) {
        submissions.forEach(function (sub) {
          sub.ip_address_info = ipInfo[sub.ip_address];
        });
        console.log(submissions)
      });
    }

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
      return panic(tr('forms::Submission is corrupted.'));
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
