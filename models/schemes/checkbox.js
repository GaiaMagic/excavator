module.exports = {
  name: 'checkbox',

  title: 'Checkbox', /* tr('schemes::Checkbox') */

  maintainers: [
    'caiguanhao <caiguanhao@gmail.com>'
  ],

  versions: [
    '1.0'
  ],

  latest: '1.0',

  '1.0': {
    schemeDefaults: [
      'i18n.translate',
      function (tr) {
        return {
          enum: [{
            label: tr('schemes::checkbox::True'),
            value: true,
          }, {
            label: tr('schemes::checkbox::False'),
            value: false,
          }]
        };
      }
    ],
    templateInit: [
      'func.enumerate',
      'func.enumerate.stat',
      'func.enumerate.groupBy',
      function (enumerate, enumerateStat, groupBy) {
        var self = this;
        var scheme = this.scheme;
        var items = enumerate(scheme.enum);
        var stat = enumerateStat(items);

        if (!stat.isValid) {
          throw 'Enum of checkbox must be an object.';
        }

        var defValue;
        if (stat.isObject) {
          defValue = items[0].value;
        } else {
          defValue = items[0];
        }

        this.items = items;
        this.stat = stat;

        this.data[scheme.model] = this.data[scheme.model] || [];

        this.toggle = function (item) {
          self.data[scheme.model] = self.data[scheme.model] || [];
          var value = stat.isObject ? item.value : item;
          var index = self.data[scheme.model].indexOf(value);
          if (index > -1) {
            self.data[scheme.model].splice(index, 1);
          } else {
            self.data[scheme.model].push(value);
          }
        };
        this.exists = function (item) {
          if (!angular.isArray(self.data[scheme.model])) return false;
          var value = stat.isObject ? item.value : item;
          return self.data[scheme.model].indexOf(value) > -1;
        };
      }
    ],
    template: [
      function () {
        return [
          '<div class="form-group scheme" ',
            'ng-class="{\'has-error\': scheme.$error}">',
            '<label class="col-sm-2 control-label ',
              'scheme-label">{{ label }}</label>',
            '<div class="col-sm-10 scheme-content">',
              '<div class="checkbox {{ class }}" ng-repeat="item in items">',
                '<label>',
                  '<input type="checkbox" ng-click="toggle(item)" ng-checked="exists(item)"> ',
                  '<span ng-bind="item.label || item"></span>',
                '</label>',
              '</div>',
              '<p class="help-block" ng-show="scheme.$error !== undefined" ',
                'ng-bind="scheme.validatorMessage"></p>',
            '</div>',
          '</div>'
        ];
      }
    ],
    editor: [
      'i18n.translate',
      function (tr) {
        var ret = [];
        var fields = {
          model: tr('schemes::checkbox::Model'),
          label: tr('schemes::checkbox::Label')
        };
        for (var name in fields) {
          ret = ret.concat([
            '<div class="form-group col-md-6 col-lg-4">',
              '<label class="col-sm-3 control-label">', fields[name], '</label>',
              '<div class="col-sm-9">',
                '<input type="text" class="form-control" ',
                  'ng-model-options="{ updateOn: \'blur\'}" ',
                  'ng-model="data.', name, '">',
              '</div>',
            '</div>'
          ]);
        }
        ret = ret.concat([
          '<div class="form-group col-md-12">',
            '<label class="col-sm-12 col-12-2 control-label">',
              tr('schemes::checkbox::ENUM'), '</label>',
            '<div class="col-sm-12 col-12-10">',
              '<enumerator for="data" attr="enum"></enumerator>',
            '</div>',
          '</div>',
          '<div class="form-group col-md-12">',
            '<label class="col-sm-12 col-12-2 control-label">',
              tr('schemes::checkbox::Validator'), '</label>',
            '<div class="col-sm-12 col-12-10">',
              '<validator for="data.validator"></validator>',
            '</div>',
          '</div>'
        ]);
        return ret;
      }
    ]
  }
};
