module.exports = {
  name: 'multiple-choice',

  title: 'Multiple Choice',

  maintainers: [
    'caiguanhao <caiguanhao@gmail.com>'
  ],

  versions: [
    '1.0'
  ],

  latest: '1.0',

  '1.0': {
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
          '<div class="form-group">',
            '<label class="col-sm-2 control-label">{{ label }}</label>',
            '<div class="col-sm-10">',
              '<select class="form-control" ng-model="data.{{ model }}" ',
                'ng-options="', expr, '">',
              '</select>',
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
