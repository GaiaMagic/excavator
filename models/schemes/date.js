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
      '$filter',
      'i18n.translate',
      function ($filter, tr) {
        var format = 'yyyy-MM-dd';
        this.datetypes = [
          {
            label: tr('schemes::date::String'),
            value: 'string'
          }, {
            label: tr('schemes::date::Timestamp'),
            value: 'number'
          }, {
            label: tr('schemes::date::Date'),
            value: 'date'
          }, {
            label: tr('schemes::date::ISO Date'),
            value: 'iso'
          }
        ];
        this.scheme.datetype = this.scheme.datetype || 'string';
        this.scheme.dateformat = this.scheme.dateformat || format;
        var datemin = this.scheme.datemin;
        var datemax = this.scheme.datemax;
        this.scheme.validator = new Function([
          'return function (data) {',
          '  data = +new Date(data); ' +
            'return data >= ' + (datemin || 0) +
            (datemax ? ' && data <= ' + datemax : '') +
            ';',
          '};'
        ].join('\n'))();
        var prefix = 'be a date';
        var msg = this.scheme.validatorMessage;
        if (!msg) delete this.scheme.validatorDirty;
        if (!this.scheme.validatorDirty) {
          var cdate = $filter('date');
          msg = prefix;
          if (datemin) {
            if (datemax) {
              msg += ' from ' + cdate(datemin, format);
              msg += ' to ' + cdate(datemax, format);
            } else {
              msg += ' after ' + cdate(datemin, format);
            }
          } else {
            if (datemax) {
              msg += ' before ' + cdate(datemax, format);
            }
          }
          this.scheme.validatorMessage = msg;
        }
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
      'i18n.translate',
      function (tr) {
        var ret = [];
        var fields = {
          model: tr('schemes::date::Model'),
          label: tr('schemes::date::Label'),
          placeholder: tr('schemes::date::Placeholder'),
          default: tr('schemes::date::Default'),
          dateformat: tr('schemes::date::Format')
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
            '<label class="col-sm-3 control-label">',
              tr('schemes::date::Type'), '</label>',
            '<div class="col-sm-9">',
              '<select class="form-control" ng-options="',
                'item.value as item.label for item in datetypes" ',
                'ng-model="data.datetype"></select>',
            '</div>',
          '</div>'
        ]);
        ret = ret.concat([
          '<div class="form-group col-md-6">',
            '<label class="col-sm-3 control-label">',
              tr('schemes::date::Min'), '</label>',
            '<div class="col-sm-9">',
              '<input type="text" class="form-control" ',
                'ng-model="data.datemin" bs-datepicker ',
                'data-max-date="[[ data.datemax ]]" ',
                'data-date-format="yyyy-MM-dd" ',
                'data-date-type="number">',
            '</div>',
          '</div>',
          '<div class="form-group col-md-6">',
            '<label class="col-sm-3 control-label">',
              tr('schemes::date::Max'), '</label>',
            '<div class="col-sm-9">',
              '<input type="text" class="form-control" ',
                'ng-model="data.datemax" bs-datepicker ',
                'data-min-date="[[ data.datemin ]]" ',
                'data-date-format="yyyy-MM-dd" ',
                'data-date-type="number">',
            '</div>',
          '</div>',
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
