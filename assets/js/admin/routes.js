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
  'resolver.templates',
  'resolver.template',
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
    templatesResolver,
    templateResolver,
    managersResolver
  ) {
    $routeProvider.

    when('/', {
      redirectTo: '/forms'
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

    when('/forms/:formid', {
      redirectTo: '/forms/:formid/submissions'
    }).

    when('/forms/:formid/submissions', {
      templateUrl: '/submissions/list.html',
      controller: 'controller.shared.submission.list as cssl',
      resolve: {
        loggedIn: authNeededResolver,
        submissions: submissionsResolver('backend.submission.list')
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

    when('/forms/:formid/submissions/:subid', {
      templateUrl: '/submissions/view.html',
      controller: 'controller.shared.submission.view as cssv',
      resolve: {
        loggedIn: authNeededResolver,
        setStatusPrefix: isResolver(),
        currentForm: formResolver('backend.form.get'),
        currentSubmission: submissionResolver('backend.submission.get')
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

    when('/templates/edit/:tplid', {
      templateUrl: '/templates/edit.html',
      controller: 'controller.control.template.edit as ccte',
      resolve: {
        loggedIn: authNeededResolver,
        currentTpl: templateResolver()
      }
    }).

    when('/templates', {
      templateUrl: '/templates/list.html',
      controller: 'controller.control.template.list as cctl',
      resolve: {
        loggedIn: authNeededResolver,
        templates: templatesResolver()
      }
    }).

    when('/templates/create', {
      templateUrl: '/templates/edit.html',
      controller: 'controller.control.template.edit as ccte',
      resolve: {
        loggedIn: authNeededResolver,
        currentTpl: [function () {
          return undefined;
        }]
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

    when('/passwd', {
      templateUrl: '/passwd.html',
      controller: 'controller.shared.user.passwd as csup',
      resolve: {
        loggedIn: authNeededResolver
      }
    }).

    when('/login', {
      templateUrl: '/login.html',
      controller: 'controller.shared.user.login as csul',
      resolve: {
        loggedIn: authSuccessResolver
      }
    }).

    otherwise({
      redirectTo: '/login'
    });

    $locationProvider.html5Mode(true);
  }
]);
