module.exports = {
  name: 'hierarchy',

  title: 'Hierarchy',

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
      }
    ],
    editorInit: [
      'misc.hierarchies',
      function (hierarchies) {
        this.data.levels = this.data.levels || 3;

        this.hierarchies = hierarchies;
        this.data.hierarchy = this.data.hierarchy || this.hierarchies[0];
        // console.log(this)
        if (angular.isArray(this.data.hierarchy.data)) {
          this.data.models = this.data.hierarchy.data
        } else {
          // this.data.models = this.data.models || [];
          // for (var i = this.data.models.length; i < this.data.levels; i++) {
          //   this.data.models[i] = 'undetermined' + (+new Date + i);
          // }
          // this.data.models.length = this.data.levels;
        }
      }
    ],
    template: [
      function () {
        return [
          '<div hierarchy>',
            '<div class="form-group" ng-repeat="slice in slices">',
              '<label class="col-sm-2 control-label">[[ scheme.models[$index].label ]]</label>',
              '<div class="col-sm-10">',
                '<select ng-options="item for item in slice" ',
                  'ng-model="selects[$index]" class="form-control">',
                  '<option value="" ng-if="$index === 0">',
                  '- Please choose one -</option></select>',
              '</div>',
            '</div>',
          '</div>'
        ];
      }
    ],
    editor: [
      function () {
        var ret = [];
        ret = ret.concat([
          '<div class="form-group col-md-6">',
            '<label class="col-sm-3 control-label">Type</label>',
            '<div class="col-sm-9">',
              '<select class="form-control" ng-options="',
                'hier as hier.label for hier in hierarchies" ',
                'ng-model="data.hierarchy"></select>',
            '</div>',
          '</div>',
          '<div class="form-group col-md-6">',
            '<label class="col-sm-3 control-label">Levels</label>',
            '<div class="col-sm-9">',
              '<input type="number" class="form-control" ng-model="data.levels" min="1" max="10">',
            '</div>',
          '</div>'
        ]);
        for (var i = 0; i < this.data.levels; i++) {
          ret = ret.concat([
            '<div class="form-group col-md-6">',
              '<label class="col-sm-3 control-label">Model #', i+1, '</label>',
              '<div class="col-sm-9">',
                '<input type="text" class="form-control" ',
                  'ng-model="data.models[', i, '].model">',
              '</div>',
            '</div>',
            '<div class="form-group col-md-6">',
              '<label class="col-sm-3 control-label">Label #', i+1, '</label>',
              '<div class="col-sm-9">',
                '<input type="text" class="form-control" ',
                  'ng-model="data.models[', i, '].label">',
              '</div>',
            '</div>'
          ]);
        }
        return ret;
      }
    ]
  }
};
