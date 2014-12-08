module.exports = {
  name: 'short-text',

  title: 'Short Text', /* tr('schemes::Short Text') */

  maintainers: [
    'caiguanhao <caiguanhao@gmail.com>'
  ],

  versions: [
    '1.0'
  ],

  latest: '1.0',

  '1.0': {
    templateInit: [
      function () {
        this.data[this.scheme.model] = this.scheme.default;
      }
    ],
    template: [
      '<div class="form-group" ng-class="{\'has-error\': scheme.$error}">',
        '<label class="col-sm-2 control-label">{{ label }}</label>',
        '<div class="col-sm-10">',
          '<input type="text" class="form-control" ',
            'ng-model="data.{{ model }}" ',
            'ng-change="scheme.$unsetError()" ',
            'placeholder="{{ placeholder }}">',
          '<p class="help-block" ng-show="scheme.$error !== undefined" ',
            'ng-bind="scheme.validatorMessage"></p>',
        '</div>',
      '</div>'
    ],
    editor: [
      'i18n.translate',
      function (tr) {
        var ret = [];
        var fields = {
          model: tr('schemes::short-text::Model'),
          label: tr('schemes::short-text::Label'),
          placeholder: tr('schemes::short-text::Placeholder'),
          default: tr('schemes::short-text::Default')
        };
        for (var name in fields) {
          ret = ret.concat([
            '<div class="form-group col-md-6 col-lg-4">',
              '<label class="col-sm-3 control-label">', fields[name],
              '</label>',
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
              tr('schemes::short-text::Validator'), '</label>',
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
