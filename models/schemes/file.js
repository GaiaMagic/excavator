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
    validator: function (scheme, data) {
      var tr = this.tr;
      var bytes = this.bytes;
      var value = data[scheme.model];
      var result = (function () {
        if (typeof value !== 'string' ||
                   value.indexOf('data:image/jpeg;base64,') !== 0) {
          return false;
        }
        if (typeof scheme.size !== 'number') {
          return false;
        }
        if (value.length > scheme.size) {
          return false;
        }
        return true;
      })();
      return {
        result: result,
        errorMsgs: tr('validator::Please provide a ' +
          'JPEG image file whose size is less than {{size}}.', {
          size: bytes(scheme.size)
        })
      };
    },
    templateInit: [
      'misc.bytes',
      function (bytes) {
        this.sizeof = function (base64) {
          return bytes(base64.length * 3 / 4);
        };
      }
    ],
    editorInit: [
      'i18n.translate',
      'misc.bytes',
      function (tr, bytes) {
        this.bytes = bytes;
        this.sizes = [ '100KB', '500KB', '1MB', '2MB', '3MB', '5MB' ];
        if (!angular.isNumber(this.scheme.size)) {
          this.scheme.size = bytes('1M');
        }
        if (!this.scheme.validatorMessage ||
            !this.scheme.validatorMessageCustom) {
          this.scheme.validatorMessage = tr('validator::Please provide a ' +
            'JPEG image file whose size is less than {{size}}.', {
            size: bytes(this.scheme.size)
          });
          this.scheme.validatorMessageCustom = false;
        }
      }
    ],
    template: [
      'i18n.translate',
      function (tr) {
        return [
          '<div class="form-group scheme" ',
            'ng-class="{\'has-error\': scheme.$error}">',
            '<label class="col-sm-2 control-label ',
              'scheme-label">{{ label }}</label>',
            '<div class="col-sm-10 scheme-content">',
              '<div class="btn-group">',
                '<p ng-if="imageLoading">', tr('forms::Please wait...'), '</p>',
                '<div class="thumbnail preview-image" ng-if="data.{{ model }}">',
                  '<img ng-src="[[ data.{{ model }} ]]">',
                  '<small class="block caption text-center">',
                    '~ <span ng-bind="sizeof(data.{{ model }})"></span> ',
                    '<a href ng-click="data.{{ model }} = undefined">',
                      '<span class="glyphicon glyphicon-remove"></span>',
                    '</a>',
                  '</small>',
                '</div>',
                '<input accept=".jpg" file="{{ model }}" type="file">',
                '<p class="help-block" ng-if="scheme.validatorMessage" ',
                  'ng-bind="scheme.validatorMessage"></p>',
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
            '<div class="form-group col-md-6">',
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
            '<label class="col-sm-12 col-12-3 control-label">',
              tr('schemes::file::Size Limit'),
            '</label>',
            '<div class="col-sm-12 col-12-9">',
              '<div class="btn-group btn-group-sm">',
                '<button class="btn btn-default" ',
                  'ng-class="{active: data.size === bytes(size)}" ',
                  'ng-click="data.size = bytes(size)" ',
                  'ng-repeat="size in sizes" ',
                  'ng-bind="size"></button>',
              '</div>',
            '</div>',
          '</div>',
          '<div class="form-group col-md-12">',
            '<label class="col-sm-12 col-12-3 control-label">',
              tr('schemes::file::Help Text'),
            '</label>',
            '<div class="col-sm-12 col-12-9">',
              '<input type="text" class="form-control" ',
                'placeholder="', tr('validator::Help text'), '" ',
                'ng-model-options="{ updateOn: \'blur\'}" ',
                'ng-change="data.validatorMessageCustom = true" ',
                'ng-model="data.validatorMessage">',
            '</div>',
          '</div>'
        ]);
        return ret;
      }
    ]
  }
};
