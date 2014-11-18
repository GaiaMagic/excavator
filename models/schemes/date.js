module.exports = {
  name: 'date',

  title: 'Date',

  maintainers: [
    'caiguanhao <caiguanhao@gmail.com>'
  ],

  versions: [
    '1.0'
  ],

  latest: '1.0',

  '1.0': {
    schemeDefaults: {},
    templateInit: [
      function () {
        this.data[this.scheme.model] = this.scheme.default;
      }
    ],
    editorInit: [
      function () {
        this.datetypes = [
          {
            label: 'String',
            value: 'string'
          }, {
            label: 'Timestamp',
            value: 'number'
          }, {
            label: 'Date',
            value: 'date'
          }, {
            label: 'ISO Date',
            value: 'iso'
          }
        ];
        this.scheme.datetype = this.scheme.datetype || 'string';
        this.scheme.dateformat = this.scheme.dateformat || 'yyyy-MM-dd';
      }
    ],
    template: [
      function () {
        return [
          '<div class="form-group">',
            '<label class="col-sm-2 control-label">{{ label }}</label>',
            '<div class="col-sm-10">',
              '<input type="text" class="form-control" ',
                'placeholder="{{ placeholder }}" ',
                'data-date-format="{{ dateformat || \'yyyy-MM-dd\' }}" ',
                'data-date-type="{{ datetype }}" ',
                'data-min-date="{{ datemin }}" ',
                'data-max-date="{{ datemax }}" ',
                'ng-model="data.{{ model }}" bs-datepicker>',
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
          placeholder: 'Placeholder',
          default: 'Default',
          dateformat: 'Format'
        };
        for (var name in fields) {
          ret = ret.concat([
            '<div class="form-group col-md-6">',
              '<label class="col-sm-3 control-label">', fields[name],
              '</label>',
              '<div class="col-sm-9">',
                '<input type="text" class="form-control" ',
                  'ng-model="data.', name, '">',
              '</div>',
            '</div>'
          ]);
        }
        ret = ret.concat([
          '<div class="form-group col-md-6">',
            '<label class="col-sm-3 control-label">Type</label>',
            '<div class="col-sm-9">',
              '<select class="form-control" ng-options="',
                'item.value as item.label for item in datetypes" ',
                'ng-model="data.datetype"></select>',
            '</div>',
          '</div>'
        ]);
        fields = {
          datemin: 'Min',
          datemax: 'Max'
        };
        for (var name in fields) {
          ret = ret.concat([
            '<div class="form-group col-md-6">',
              '<label class="col-sm-3 control-label">', fields[name],
              '</label>',
              '<div class="col-sm-9">',
                '<input type="text" class="form-control" ',
                  'ng-model="data.', name, '" bs-datepicker ',
                  'data-date-format="yyyy-MM-dd" ',
                  'data-date-type="number">',
              '</div>',
            '</div>'
          ]);
        }
        return ret;
      }
    ]
  }
};
