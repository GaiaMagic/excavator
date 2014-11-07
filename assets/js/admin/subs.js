angular.module('excavator.admin.subs', []).

controller('AdminSubmissionsController', [
  'backend.submission.list',
  function (list) {
    var self = this;
    list().then(function (res) {
      self.submissions = res.data;
    });
  }
]);
