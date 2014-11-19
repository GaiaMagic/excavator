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
          if (typeof scheme.hierarchyCustom === 'string') {
            hierarchy = JSON.parse(scheme.hierarchyCustom);
          }
          if (typeof hierarchy !== 'object') {
            hierarchy = hierarchies.require(scheme.hierarchy);
          }
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
      'misc.hierarchies',
      function (hierarchies) {
        if (this.scheme.hierarchy === 'custom') {
          this.hierarchy = {
            name: 'custom',
            label: 'Custom',
            data: [{}]
          };
        } else {
          this.hierarchy = angular.copy(hierarchies.findByName(this.scheme.hierarchy));
        }
      }
    ],
    editorInit: [
      'misc.hierarchies',
      function (hierarchies) {
        this.presets = angular.copy(hierarchies);
        var customPreset = {
          name: 'custom',
          label: 'Custom',
          data: [{}]
        };
        this.presets.push(customPreset);

        if (!this.hierarchy) {
          var hierarchy = hierarchies.findByName(this.scheme.hierarchy);
          if (hierarchy) {
            this.hierarchy = angular.copy(hierarchy);
          } else {
            this.hierarchy = customPreset;
            this.data.hierarchy = 'custom';
            this.data.models = this.data.models || angular.copy([{}]);
          }
        }

        this.presetChanged = function () {
          if (this.preset) {
            this.hierarchy = hierarchies.findByName(this.preset.name);
            this.data.hierarchy = this.preset.name;
            delete this.data.hierarchyCustom;
            this.data.models = angular.copy(this.preset.data);
          }
          this.preset = undefined;
        };
      }
    ],
    template: [
      function () {
        return [
          '<div hierarchy>',
            '<div class="form-group" ng-if="!slices">',
              '<label class="col-sm-2 control-label" ',
                  'ng-bind="scheme.models[0].label"></label>',
              '<div class="col-sm-10">',
                '<p class="form-control-static">No options available.</p>',
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
            '<label class="col-sm-3 control-label">Presets</label>',
            '<div class="col-sm-9">',
              '<select class="form-control" ng-options="',
                'preset as preset.label group by preset.group for preset in presets" ',
                'ng-model="preset" ng-change="presetChanged()">',
                '<option value="">- Choose one preset -</option>',
              '</select>',
            '</div>',
          '</div>',
          '<div class="form-group col-md-6">',
            '<label class="col-sm-3 control-label">Levels</label>',
            '<div class="col-sm-9">',
              '<input type="number" class="form-control" ',
                'ng-model="data.models.length" min="1" max="10">',
            '</div>',
          '</div>'
        ]);
        for (var i = 0; i < this.data.models.length; i++) {
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
        ret = ret.concat([
          '<div class="form-group col-md-12" ',
            'ng-show="data.hierarchy === \'custom\'">',
            '<label class="col-sm-12 col-12-2 control-label">Custom</label>',
            '<div class="col-sm-12 col-12-10">',
              '<textarea class="form-control monospace" rows="10" ',
                'behave-editor ng-model="data.hierarchyCustom" ',
                'ng-model-options="{ updateOn: \'blur\'}" ',
                'placeholder="Type your JSON here..."></textarea>',
            '</div>',
          '</div>'
        ]);
        return ret;
      }
    ]
  }
};
