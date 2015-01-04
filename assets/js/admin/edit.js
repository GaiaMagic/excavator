/*
  for gettext:
    - tr('forms::(unlabeled)')
*/
angular.module('excavator.admin.edit', []).

controller('controller.control.form.edit', [
  '$injector',
  '$scope',
  '$timeout',
  '$route',
  'schemes',
  'form.access.control',
  'form.create.new',
  'func.array',
  'func.dom.input.remember.state',
  'func.dom.preview.scroll.editor',
  'func.localstorage.load',
  'func.localstorage.remove',
  'func.localstorage.save',
  'func.scheme.parse',
  'func.scheme.stringify',
  'func.panic',
  'func.panic.confirm',
  'currentForm',
  'i18n.translate',
  'shared.domains',
  function (
    $injector,
    $scope,
    $timeout,
    $route,
    schemes,
    accessControl,
    createNew,
    funcArray,
    rememberState,
    preview2editor,
    load,
    remove,
    save,
    parse,
    stringify,
    panic,
    confirm,
    currentForm,
    tr,
    domains
  ) {
  var self = this;

  this.isUnsavedData = false;
  this.tryToLoadFromUnsavedData = function () {
    var data = load('schemedata', parse);
    if (angular.isObject(data)) {
      this.form.content = data;
      this.isUnsavedData = true;
    }
  };
  if (angular.isUndefined(currentForm)) {
    this.form = {};
    if (load('schemedatafor') === '') {
      this.tryToLoadFromUnsavedData();
    }
    if (!this.form.content) {
      this.form.content = {scheme:[]};
    }
    this.isNew = true;
  } else if (currentForm === false) {
    return panic(tr('forms::Form is corrupted.'));
  } else {
    this.form = currentForm;
    if (load('schemedatafor') === currentForm.form._id) {
      this.tryToLoadFromUnsavedData();
    }
    this.isNew = false;
  }

  this.form.content.data = this.form.content.data || {};

  this.def_formdata = tr('forms::Form data will appear here ' +
    'once you submit the form.', undefined, { fake: true });
  this.submit = function () {
    this.formdata = angular.toJson(this.form.content.data, true);
  };

  this.views = ['preview', 'code'];
  this.view = load('editorview') || this.views[0];
  this.setView = function (view) {
    if (this.view === view) {
      this.view = undefined;
      save('editorview', 'none');
      return;
    }
    this.view = view;
    save('editorview', this.view);
  };
  this.hasView = function () {
    return this.views.indexOf(this.view) > -1;
  };

  this.clearData = function () {
    var data = this.form.content.data;
    for (var key in data) {
      delete data[key];
    }
    this.submit();
  };

  this.removeUnsavedData = function () {
    remove('schemedatafor');
    remove('schemedata');
    $route.reload();
  };

  this.save = function () {
    createNew(currentForm, this.form.content).then(function () {
      if (currentForm) {
        self.removeUnsavedData();
      }
    }).catch(function (data) {
      save('schemedatafor', currentForm.form._id)
      save('schemedata', self.schemedata);
    });
  };

  this.access = function () {
    accessControl(currentForm).then(function (form) {
      self.form.form.managers = form.managers;
    });
  };

  this.schemes = schemes.list();

  this.add = function (name, version) {
    var scheme = schemes.get(name, version);
    if (angular.isUndefined(scheme)) return panic(tr('forms::No such item.'));
    var schemeDefaults;
    if (angular.isArray(scheme.schemeDefaults)) {
      schemeDefaults = $injector.invoke(scheme.schemeDefaults);
    }
    var schemeToAdd = angular.extend({
      type: name,
      version: version
    }, schemeDefaults);
    this.form.content.scheme.push(schemeToAdd);
  };

  this.clear = function () {
    this.form.content.scheme.splice(0);
    remove('schemedatafor');
    remove('schemedata');
  };

  /* since behave.js changes the events on textareas with ng-model,
   * currently there is no easy way to use ng-model directly, so
   * use the old method
   */
  this.update = function (parsed) {
    try {
      var data = $scope.$getschemedata();
      var parsed = parse(data);
      if (typeof parsed !== 'object' || !(parsed.scheme instanceof Array)) {
        throw tr('forms::Could not update the code because ' +
          'the code is not valid.');
      }
      delete this.form.content.scheme;
      angular.extend(this.form.content, parsed);
      this.codeViewEditorDirty = false;
    } catch (e) {
      if (e instanceof Error && e.message) {
        panic(e.message);
      } else {
        panic(e);
      }
    }
  };
  $scope.$on('schemedata changed', function () {
    self.codeViewEditorDirty = true;
  });
  this.reset = function () {
    confirm(
      tr('forms::Are you sure you want to reset the code?'),
      undefined,
      { class: 'btn-primary', text: tr('forms::Yes, reset code') },
      { text: tr('forms::Cancel') }
    ).
    then(function () {
      $scope.$setschemedata(self.setschemedata());
      self.codeViewEditorDirty = false;
    });
  };

  this.array = funcArray;
  this.tr = tr;
  this.domains = domains;
  this.schemedataOriginal;

  this.setschemedata = function () {
    var content = this.form.content;

    this.savable = true;
    if (this.isNew) {
      if (!angular.isArray(content.scheme) || content.scheme.length === 0) {
        this.savable = false;
      }
    }

    this.schemedata = stringify(content, ['scheme']);
    if (this.schemedataOriginal === undefined) {
      this.schemedataOriginal = this.schemedata;
    }
    if (this.schemedataOriginal !== this.schemedata) {
      save('schemedatafor', this.isNew ? '' : currentForm.form._id);
      save('schemedata', this.schemedata);
    }
    return this.schemedata;
  };

  var debounce;
  $scope.$watch(function () {
    return self.form.content.scheme;
  }, function (value) {
    if (debounce) {
      $timeout.cancel(debounce);
    }
    debounce = $timeout(function () {
      $scope.$broadcast('update scheme view', value, rememberState());
      self.setschemedata();
      debounce = undefined;
    }, 100);
  }, true);

  this.activePanel = -1;
  $scope.$watch(function () {
    return self.activePanel;
  }, preview2editor);
}]);
