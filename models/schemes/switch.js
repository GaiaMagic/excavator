module.exports = {
  name: 'switch',

  title: 'Switch',

  maintainers: [
    'caiguanhao <caiguanhao@gmail.com>'
  ],

  versions: [
    '1.0'
  ],

  latest: '1.0',

  '1.0': {
    schemeDefaults: {
      enum: [{
        label: 'YES',
        value: true
      }, {
        label: 'NO',
        value: false
      }]
    },
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
        this.data[scheme.model] = angular.isDefined(scheme.default) ?
          scheme.default : defValue;
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
                'ng-click="data.{{ model }} = item.value" ',
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
                'ng-click="data.{{ model }} = item.value" ',
                'ng-repeat="item in items" ng-bind="item.label">'
              ] : [
                'ng-class="{ active: item === data.{{ model }} }" ',
                'ng-click="data.{{ model }} = item" ',
                'ng-repeat="item in items" ng-bind="item">'
          ]).concat([
              '</button>',
            '</div>'
          ]);
        }

        return [
          '<div class="form-group">',
            '<label class="col-sm-2 control-label">{{ label }}</label>',
            '<div class="col-sm-10">',
              buttons.join(''),
            '</div>',
          '</div>'
        ];
      }
    ],
    editor: [
      function () {
        var ret = [];
        var fields = {
          model: 'Model',
          label: 'Label',
          default: 'Default'
        };
        for (var name in fields) {
          ret = ret.concat([
            '<div class="form-group">',
              '<label class="col-sm-2 control-label">', fields[name], '</label>',
              '<div class="col-sm-10">',
                '<input type="text" class="form-control" ',
                  'ng-model="data.', name, '">',
              '</div>',
            '</div>'
          ]);
        }
        ret = ret.concat([
          '<div class="form-group">',
            '<label class="col-sm-2 control-label">ENUM</label>',
            '<div class="col-sm-10">',
              '<textarea class="form-control monospace" rows="8" ',
                'code-editor ng-model="data.enum" ',
                'ng-model-options="{ debounce: 500 }"></textarea>',
            '</div>',
          '</div>'
        ]);
        return ret;
      }
    ]
  }
};
