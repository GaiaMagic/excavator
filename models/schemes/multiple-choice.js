module.exports = {
  name: 'multiple-choice',

  title: 'Multiple Choice', /* tr('schemes::Multiple Choice') */

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
            label: tr('schemes::multiple-choice::Yes, I do.'),
            value: true,
            group: tr('schemes::multiple-choice::YES')
          }, {
            label: tr('schemes::multiple-choice::No, I don\'t'),
            value: false,
            group: tr('schemes::multiple-choice::NO')
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
          throw 'Enum of multiple-choice must be an object.';
        }

        var defValue;
        if (stat.isObject) {
          defValue = items[0].value;
        } else {
          defValue = items[0];
        }

        this.items = items;
        this.stat = stat;
        this.data[scheme.model] = angular.isDefined(scheme.default) ?
          scheme.default : defValue;
      }
    ],
    template: [
      function () {
        var stat = this.stat;
        var expr;
        if (stat.isObjectHasGroup) {
          expr = 'item.value as item.label || item.value group by item.group ' +
            'for item in items';
        } else if (stat.isObject) {
          expr = 'item.value as item.label || item.value for item in items';
        } else {
          expr = 'item for item in items';
        }
        return [
          '<div class="form-group" ng-class="{\'has-error\': scheme.$error}">',
            '<label class="col-sm-2 control-label">{{ label }}</label>',
            '<div class="col-sm-10">',
              '<select class="form-control" ng-model="data.{{ model }}" ',
                'ng-options="', expr, '" ',
                'ng-change="scheme.$unsetError()">',
              '</select>',
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
          model: tr('schemes::multiple-choice::Model'),
          label: tr('schemes::multiple-choice::Label'),
          default: tr('schemes::multiple-choice::Default')
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
              tr('schemes::multiple-choice::ENUM'), '</label>',
            '<div class="col-sm-12 col-12-10">',
              '<enumerator for="data" attr="enum"></enumerator>',
            '</div>',
          '</div>',
          '<div class="form-group col-md-12">',
            '<label class="col-sm-12 col-12-2 control-label">',
              tr('schemes::multiple-choice::Validator'), '</label>',
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
