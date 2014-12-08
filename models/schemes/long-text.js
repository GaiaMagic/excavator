module.exports = {
  name: 'long-text',

  title: 'Long Text', /* tr('schemes::Long Text') */

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
    editorInit: [
      function () {
        this.scheme.rows = +this.scheme.rows || 3;
      }
    ],
    template: [
      '<div class="form-group" ng-class="{\'has-error\': scheme.$error}">',
        '<label class="col-sm-2 control-label">{{ label }}</label>',
        '<div class="col-sm-10">',
          '<textarea class="form-control" rows="{{ rows || 3 }}" ',
            'ng-model="data.{{ model }}" ',
            'ng-change="scheme.$unsetError()" ',
            'placeholder="{{ placeholder }}"></textarea>',
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
          model: tr('schemes::long-text::Model'),
          label: tr('schemes::long-text::Label'),
          rows: tr('schemes::long-text::Rows'),
          placeholder: tr('schemes::long-text::Placeholder')
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
              tr('schemes::long-text::Default'), '</label>',
            '<div class="col-sm-12 col-12-10">',
              '<textarea class="form-control" rows="3" ',
                'ng-model-options="{ updateOn: \'blur\'}" ',
                'ng-model="data.default"></textarea>',
            '</div>',
          '</div>',
          '<div class="form-group col-md-12">',
            '<label class="col-sm-12 col-12-2 control-label">',
              tr('schemes::long-text::Validator'), '</label>',
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
