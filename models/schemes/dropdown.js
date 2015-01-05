module.exports = {
  name: 'dropdown',

  title: 'Dropdown', /* tr('schemes::Dropdown') */

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
            label: tr('schemes::dropdown::Yes, I do.'),
            value: true
          }, {
            label: tr('schemes::dropdown::No, I don\'t'),
            value: false
          }]
        };
      }
    ],
    templateInit: [
      'func.enumerate',
      'func.enumerate.stat',
      'func.enumerate.groupBy',
      'i18n.translate',
      'misc.async',
      function (enumerate, enumerateStat, groupBy, tr, async) {
        async([
          'jquery2',
          'dropdowns-enhancement',
        ]);
        var scheme = this.scheme;
        var items = enumerate(scheme.enum);
        var stat = enumerateStat(items);

        if (!stat.isValid) {
          throw 'Enum of dropdown must be an object.';
        }

        this.items = items;
        this.select = function (item) {
          this.data[scheme.model] = angular.isDefined(item.value) ? item.value : item;
        };
        this.current = function () {
          if (angular.isArray(this.items)) {
            for (var i = 0; i < this.items.length; i++) {
              if (angular.isObject(this.items[i])) {
                if (this.items[i].value === this.data[scheme.model]) {
                  return this.items[i].label;
                }
                continue;
              }
              if (this.items[i] === this.data[scheme.model]) {
                return this.items[i];
              }
            }
          }
          return undefined;
        };
        this.tr = tr; /* tr('dropdown::Please select') */
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
              '<div class="btn-group form-dropdown">',
                '<button class="btn btn-default form-dropdown-toggle dropdown-toggle" ',
                  'data-toggle="dropdown" type="button">',
                  '<span class="caret"></span>',
                  '<span ng-bind="current() || ',
                    'tr(\'dropdown::Please select\')"></span> ',
                '</button>',
                '<ul class="form-dropdown-menu dropdown-menu">',
                  '<li ng-repeat="item in items">',
                    '<label ng-bind="item.label || item" ',
                      'ng-click="select(item);scheme.$unsetError()"></label>',
                  '</li>',
                '</ul>',
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
          model: tr('schemes::dropdown::Model'),
          label: tr('schemes::dropdown::Label')
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
              tr('schemes::dropdown::ENUM'), '</label>',
            '<div class="col-sm-12 col-12-10">',
              '<enumerator for="data" attr="enum"></enumerator>',
            '</div>',
          '</div>',
          '<div class="form-group col-md-12">',
            '<label class="col-sm-12 col-12-2 control-label">',
              tr('schemes::dropdown::Validator'), '</label>',
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
