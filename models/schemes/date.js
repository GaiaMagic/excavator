module.exports = {
  name: 'date',

  title: 'Date', /* tr('schemes::Date') */

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
        if (!this.scheme.validatorMessage ||
            !this.scheme.validatorMessageCustom) {
          var cdate = $filter('date');
          var msg = tr('validator::should be a valid date like {{example}}', {
            example: cdate(new Date, format)
          });
          if (datemin) {
            if (datemax) {
              msg = tr('validator::should be a valid date from {{start}} to ' +
              '{{end}}', {
                start: cdate(datemin, format),
                end: cdate(datemax, format)
              });
            } else {
              msg = tr('validator::should be a valid date after {{start}}', {
                start: cdate(datemin, format)
              });
            }
          } else {
            if (datemax) {
              msg = tr('validator::should be a valid date before {{end}}', {
                end: cdate(datemax, format)
              });
            }
          }
          this.scheme.validatorMessage = msg;
          this.scheme.validatorMessageCustom = false;
        }
      }
    ],
    template: [
      function () {
        return [
          '<div class="form-group" ng-class="{\'has-error\': scheme.$error}">',
            '<label class="col-sm-2 control-label">{{ label }}</label>',
            '<div class="col-sm-10">',
              '<input type="text" class="form-control" ',
                'placeholder="{{ placeholder }}" ',
                'data-date-format="{{ dateformat || \'yyyy-MM-dd\' }}" ',
                'data-date-type="{{ datetype }}" ',
                'data-min-date="{{ datemin }}" ',
                'data-max-date="{{ datemax }}" ',
                'ng-change="scheme.$unsetError()" ',
                'ng-model="data.{{ model }}" bs-datepicker>',
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
          model: tr('schemes::date::Model'),
          label: tr('schemes::date::Label'),
          placeholder: tr('schemes::date::Placeholder'),
          default: tr('schemes::date::Default'),
          dateformat: tr('schemes::date::Format')
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
          '<div class="form-group col-md-6 col-lg-4">',
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
          '<div class="form-group col-md-6 col-lg-4">',
            '<label class="col-sm-3 control-label">',
              tr('schemes::date::Min'), '</label>',
            '<div class="col-sm-9">',
              '<input type="text" class="form-control" ',
                'ng-model-options="{ updateOn: \'blur\'}" ',
                'ng-model="data.datemin" bs-datepicker ',
                'data-max-date="[[ data.datemax ]]" ',
                'data-date-format="yyyy-MM-dd" ',
                'data-date-type="number">',
            '</div>',
          '</div>',
          '<div class="form-group col-md-6 col-lg-4">',
            '<label class="col-sm-3 control-label">',
              tr('schemes::date::Max'), '</label>',
            '<div class="col-sm-9">',
              '<input type="text" class="form-control" ',
                'ng-model-options="{ updateOn: \'blur\'}" ',
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
