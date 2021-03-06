module.exports = {
  name: 'switch',

  title: 'Switch', /* tr('schemes::Switch') */

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
            label: tr('schemes::switch::YES'),
            value: true
          }, {
            label: tr('schemes::switch::NO'),
            value: false
          }]
        };
      }
    ],
    templateInit: [
      'func.enumerate',
      'func.enumerate.stat',
      'func.enumerate.groupBy',
      function (enumerate, enumerateStat, groupBy) {
        var scheme = this.scheme;
        var items = enumerate(scheme.enum);
        var stat = enumerateStat(items);
        if (!stat.isValid) {
          throw 'Enum of switch must be an object.';
        }

        var defValue;
        if (stat.isObject) {
          defValue = items[0].value;
        } else {
          defValue = items[0];
        }

        if (stat.isObjectHasGroup) {
          this.items = groupBy(items, 'group')
        } else {
          this.items = items;
        }

        this.stat = stat;
        if (angular.isDefined(scheme.default)) {
          this.data[scheme.model] = scheme.default;
        }
      }
    ],
    template: [
      function () {
        var stat = this.stat;
        var buttons;
        if (stat.isObjectHasGroup) {
          buttons = [
            '<div class="btn-group" ng-repeat="item_p in items">',
              '<button type="button" class="btn btn-default" ',
                'ng-class="{ active: item.value === data.{{ model }} }" ',
                'ng-click="data.{{ model }} = item.value; scheme.$unsetError()" ',
                'ng-repeat="item in item_p" ng-bind="item.label">',
              '</button>',
            '</div>',
          ];
        } else {
          buttons = [
            '<div class="btn-group">',
              '<button type="button" class="btn btn-default" '
          ].concat(stat.isObject ? [
                'ng-class="{ active: item.value === data.{{ model }} }" ',
                'ng-click="data.{{ model }} = item.value; scheme.$unsetError()" ',
                'ng-repeat="item in items" ng-bind="item.label">'
              ] : [
                'ng-class="{ active: item === data.{{ model }} }" ',
                'ng-click="data.{{ model }} = item; scheme.$unsetError()" ',
                'ng-repeat="item in items" ng-bind="item">'
          ]).concat([
              '</button>',
            '</div>'
          ]);
        }

        return [
          '<div class="form-group scheme" ',
            'ng-class="{\'has-error\': scheme.$error}">',
            '<label class="col-sm-2 control-label ',
              'scheme-label">{{ label }}</label>',
            '<div class="col-sm-10 scheme-content">',
              buttons.join(''),
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
          model: tr('schemes::switch::Model'),
          label: tr('schemes::switch::Label'),
          default: tr('schemes::switch::Default')
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
              tr('schemes::switch::ENUM'), '</label>',
            '<div class="col-sm-12 col-12-10">',
              '<enumerator for="data" attr="enum"></enumerator>',
            '</div>',
          '</div>',
          '<div class="form-group col-md-12">',
            '<label class="col-sm-12 col-12-2 control-label">',
              tr('schemes::switch::Validator'), '</label>',
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
