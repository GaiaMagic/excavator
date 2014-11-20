angular.module('excavator.routes', [
  'excavator.resolver'
]).

config([
  '$routeProvider',
  '$locationProvider',
  'backend.user.auth.success.resolver',
  'backend.user.auth.needed.resolver',
  'resolver.forms',
  'resolver.form',
  'resolver.is',
  'resolver.submissions',
  'resolver.submission',
  'resolver.managers',
  function(
    $routeProvider,
    $locationProvider,
    authSuccessResolver,
    authNeededResolver,
    formsResolver,
    formResolver,
    isResolver,
    submissionsResolver,
    submissionResolver,
    managersResolver
  ) {
    $routeProvider.

    when('/', {
      redirectTo: '/forms'
    }).

    when('/login', {
      templateUrl: '/login.html',
      controller: 'controller.control.admin.login as ccal',
      resolve: {
        loggedIn: authSuccessResolver
      }
    }).

    when('/forms/create', {
      templateUrl: '/forms/edit.html',
      controller: 'controller.control.form.edit as ccfe',
      resolve: {
        loggedIn: authNeededResolver,
        currentForm: [function () {
          return undefined;
        }]
      }
    }).

    when('/forms/edit/:formid', {
      templateUrl: '/forms/edit.html',
      controller: 'controller.control.form.edit as ccfe',
      resolve: {
        loggedIn: authNeededResolver,
        currentForm: formResolver('backend.form.get')
      }
    }).

    when('/forms', {
      templateUrl: '/forms/list.html',
      controller: 'controller.control.form.list as ccfl',
      reloadOnSearch: true,
      resolve: {
        loggedIn: authNeededResolver,
        forms: formsResolver()
      }
    }).

    when('/submissions', {
      templateUrl: '/submissions/list.html',
      controller: 'controller.shared.submission.list as cssl',
      resolve: {
        loggedIn: authNeededResolver,
        submissions: submissionsResolver('backend.submission.list')
      }
    }).

    when('/submissions/view/:subid', {
      templateUrl: '/submissions/view.html',
      controller: 'controller.shared.submission.view as cssv',
      resolve: {
        loggedIn: authNeededResolver,
        setStatusPrefix: isResolver(),
        currentSubmission: submissionResolver('backend.submission.get')
      }
    }).

    when('/managers', {
      templateUrl: '/managers/list.html',
      controller: 'controller.control.manager.list as ccml',
      resolve: {
        loggedIn: authNeededResolver,
        managers: managersResolver()
      }
    }).

    otherwise({
      redirectTo: '/login'
    });

    $locationProvider.html5Mode(true);
  }
]);
