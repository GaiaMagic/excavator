module.exports = {
  name: 'button',

  title: 'Button',

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
        type: 'submit',
        label: 'Submit',
        class: 'btn-info'
      }, {
        type: 'button',
        label: 'Cancel'
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

        if (!stat.isValid || !stat.isObject) {
          throw 'Enum of button must be an object.';
        }

        if (stat.isObjectHasGroup) {
          this.items = groupBy(items, 'group')
        } else {
          this.items = items;
        }

        this.stat = stat;
      }
    ],
    template: [
      function () {
        var stat = this.stat;
        var buttons;
        if (stat.isObjectHasGroup) {
          buttons = [
            '<div class="btn-group" ng-repeat="item_p in items">',
              '<button type="[[ item.type ]]" class="btn" ',
                'ng-class="item.class || \'btn-default\'" ',
                'ng-repeat="item in item_p" ng-bind="item.label"></button>',
            '</div>'
          ];
        } else {
          buttons = [
            '<div class="btn-group">',
              '<button type="[[ item.type ]]" class="btn" ',
                'ng-class="item.class || \'btn-default\'" ',
                'ng-repeat="item in items" ng-bind="item.label"></button>',
            '</div>'
          ];
        }
        return [
          '<div class="form-group">',
            '<div class="col-sm-offset-2 col-sm-10">',
              buttons.join(''),
            '</div>',
          '</div>'
        ];
      }
    ],
    editor: [
      function () {
        var ret = [
          '<div class="form-group">',
            '<label class="col-sm-2 control-label">Label</label>',
            '<div class="col-sm-10">',
              '<input type="text" class="form-control" ',
                'ng-model="data.label">',
            '</div>',
          '</div>',
          '<div class="form-group">',
            '<label class="col-sm-2 control-label">ENUM</label>',
            '<div class="col-sm-10">',
              '<textarea class="form-control monospace" rows="8" ',
                'code-editor ng-model="data.enum" ',
                'ng-model-options="{ debounce: 500 }"></textarea>',
            '</div>',
          '</div>'
        ];
        return ret;
      }
    ]
  }
};
