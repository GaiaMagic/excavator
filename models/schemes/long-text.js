module.exports = {
  name: 'long-text',

  title: 'Long Text',

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
      '<div class="form-group">',
        '<label class="col-sm-2 control-label">{{ label }}</label>',
        '<div class="col-sm-10">',
          '<textarea class="form-control" rows="{{ rows || 3 }}" ',
            'ng-model="data.{{ model }}" ',
            'placeholder="{{ placeholder }}"></textarea>',
        '</div>',
      '</div>'
    ],
    editor: [
      function () {
        var ret = [];
        var fields = {
          model: 'Model',
          label: 'Label',
          rows: 'Rows',
          placeholder: 'Placeholder'
        };
        for (var name in fields) {
          ret = ret.concat([
            '<div class="form-group col-md-6">',
              '<label class="col-sm-3 control-label">', fields[name], '</label>',
              '<div class="col-sm-9">',
                '<input type="text" class="form-control" ',
                  'ng-model="data.', name, '">',
              '</div>',
            '</div>'
          ]);
        }
        ret = ret.concat([
          '<div class="form-group col-md-12">',
            '<label class="col-sm-12 col-12-2 control-label">Default</label>',
            '<div class="col-sm-12 col-12-10">',
              '<textarea class="form-control" rows="3" ',
                'ng-model="data.default"></textarea>',
            '</div>',
          '</div>',
          '<div class="form-group col-md-12">',
            '<label class="col-sm-12 col-12-2 control-label">Validator</label>',
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
