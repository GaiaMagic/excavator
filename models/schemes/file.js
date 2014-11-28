module.exports = {
  name: 'file',

  title: 'File', /* tr('schemes::File') */

  maintainers: [
    'caiguanhao <caiguanhao@gmail.com>'
  ],

  versions: [
    '1.0'
  ],

  latest: '1.0',

  '1.0': {
    validator: function (value) {
      var result = false;
      var errorMsg;
      if (typeof value !== 'string' ||
                 value.indexOf('data:image/jpeg;base64,') !== 0) {
        return false;
      }
      if (value.length > 1024 * 1024 * 1.5) {
        return false;
      }
      return true;
    },
    templateInit: [
      function () {
      }
    ],
    editorInit: [
      function () {
        this.scheme.validatorMessage = '选择一张文件大小不超过1MB的JPG图片';
      }
    ],
    template: [
      'i18n.translate',
      function (tr) {
        return [
          '<div class="form-group">',
            '<label class="col-sm-2 control-label">{{ label }}</label>',
            '<div class="col-sm-10">',
              '<div class="btn-group">',
                '<p ng-if="imageLoading">', tr('forms::Please wait...'), '</p>',
                '<div class="thumbnail preview-image" ng-if="data.{{ model }}">',
                  '<img ng-src="[[ data.{{ model }} ]]">',
                  '<div class="caption text-center">',
                    '~ <span ng-bind="data.{{ model }} | b64size"></span>',
                  '</div>',
                '</div>',
                '<input accept=".jpg" file="{{ model }}" type="file">',
                '<p class="help-block">',
                  '请提供一张文件大小不超过1MB的JPG图片。',
                '</p>',
              '</div>',
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
          model: tr('schemes::file::Model'),
          label: tr('schemes::file::Label')
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
          '<div class="form-group">',
            '<div class="col-sm-12">',
              '<validator for="data.validator" static></validator>',
            '</div>',
          '</div>'
        ]);
        return ret;
      }
    ]
  }
};
