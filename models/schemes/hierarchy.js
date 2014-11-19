module.exports = {
  name: 'hierarchy',

  title: 'Hierarchy',

  maintainers: [
    'caiguanhao <caiguanhao@gmail.com>'
  ],

  versions: [
    '1.0'
  ],

  latest: '1.0',

  '1.0': {
    validator: function (scheme, data) {
      var errField;
      var result = (function () {
        if (typeof scheme !== 'object') return false;
        if (typeof scheme.hierarchy !== 'string') return false;
        if (!(scheme.models instanceof Array)) return false;

        var hierarchies = require('../../lib/hierarchies/hierarchies');
        var hierarchy;
        try {
          hierarchy = hierarchies.require(scheme.hierarchy);
        } catch(e) {}
        if (typeof hierarchy !== 'object') return false;

        var current = hierarchy;
        for (var i = 0; i < scheme.models.length; i++) {
          var model = scheme.models[i].model;
          errField = scheme.models[i].label;
          if (typeof model !== 'string') return false;
          var value = data[model];
          if (typeof value !== 'string') return false;

          if (current instanceof Array) {
            return current.indexOf(value) > -1;
          }

          current = current[value];
          if (typeof current !== 'object') return false;

          if (current instanceof Array) {
            if (current.length === 0) return true;
          }
        }

        return false;
      })();
      var errorMsg;
      if (result !== true) {
        if (errField) {
          errorMsg = 'Please choose one "' + errField + '".';
        } else {
          errorMsg = 'Internal error occurred while processing hierarchy.';
        }
      }
      return {
        result: result,
        errorMsgs: errorMsg
      };
    },
    schemeDefaults: {},
    templateInit: [
      '$filter',
      'misc.hierarchies',
      function ($filter, hierarchies) {
        if (this.scheme.hierarchy) {
          this.hierarchy = $filter('filter')(hierarchies, {
            name: this.scheme.hierarchy
          }, true)[0];
        }
        this.hierarchy = this.hierarchy || hierarchies[0];
      }
    ],
    editorInit: [
      '$filter',
      'misc.hierarchies',
      function ($filter, hierarchies) {
        this.hierarchies = hierarchies;
        if (this.data.hierarchy) {
          this.hierarchy = $filter('filter')(hierarchies, {
            name: this.data.hierarchy
          }, true)[0];
        }
        this.hierarchy = this.hierarchy || hierarchies[0];
        this.data.hierarchy = this.hierarchy.name;
        this.data.models = this.hierarchy.data
      }
    ],
    template: [
      function () {
        return [
          '<div hierarchy="hierarchy">',
            '<div class="form-group" ng-if="!slices">',
              '<label class="col-sm-2 control-label" ',
                  'ng-bind="scheme.models[0].label"></label>',
              '<div class="col-sm-10">',
                '<p class="form-control-static">Loading...</p>',
              '</div>',
            '</div>',
            '<div class="form-group" ng-repeat="slice in slices">',
              '<label class="col-sm-2 control-label" ',
                'ng-bind="scheme.models[$index].label"></label>',
              '<div class="col-sm-10">',
                '<select ng-options="item for item in slice" ',
                  'ng-model="selects[$index]" class="form-control">',
                  '<option value="" ng-if="$index === 0">',
                  '- Please choose one -</option></select>',
              '</div>',
            '</div>',
          '</div>'
        ];
      }
    ],
    editor: [
      function () {
        var ret = [];
        ret = ret.concat([
          '<div class="form-group col-md-6">',
            '<label class="col-sm-3 control-label">Type</label>',
            '<div class="col-sm-9">',
              '<select class="form-control" ng-options="',
                'hier.name as hier.label for hier in hierarchies" ',
                'ng-model="data.hierarchy"></select>',
            '</div>',
          '</div>',
          '<div class="form-group col-md-6">',
            '<label class="col-sm-3 control-label">Levels</label>',
            '<div class="col-sm-9">',
              '<input type="number" class="form-control" ',
                'ng-model="hierarchy.data.length" min="1" max="10">',
            '</div>',
          '</div>'
        ]);
        for (var i = 0; i < this.hierarchy.data.length; i++) {
          ret = ret.concat([
            '<div class="form-group col-md-6">',
              '<label class="col-sm-3 control-label">Model #', i+1, '</label>',
              '<div class="col-sm-9">',
                '<input type="text" class="form-control" ',
                  'ng-model="data.models[', i, '].model">',
              '</div>',
            '</div>',
            '<div class="form-group col-md-6">',
              '<label class="col-sm-3 control-label">Label #', i+1, '</label>',
              '<div class="col-sm-9">',
                '<input type="text" class="form-control" ',
                  'ng-model="data.models[', i, '].label">',
              '</div>',
            '</div>'
          ]);
        }
        return ret;
      }
    ]
  }
};
