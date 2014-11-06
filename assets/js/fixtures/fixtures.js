angular.module('excavator.fixtures', []).

constant('fixtures.admin.edit', {
  data: {},
  scheme: [{
    type: 'short-text',
    version: '1.0',
    model: 'fullname',
    label: 'Full Name',
    placeholder: 'Type your full name here.',
    default: undefined
  }, {
    type: 'long-text',
    version: '1.0',
    model: 'description',
    label: 'Description',
    placeholder: 'Type your description here.',
    default: undefined
  }, {
    type: 'multiple-choice',
    version: '1.0',
    model: 'age',
    label: 'Age',
    default: 20,
    enum: function () {
      return Array.apply(undefined, { length: 43 }).map(function (v, i) {
        return {
          label: i + 18 + '岁',
          value: i + 18,
          group: Math.floor((i + 18) / 10) + '0+'
        };
      });
    }
  }, {
    type: 'switch',
    version: '1.0',
    model: 'accept',
    label: 'Accept?',
    default: false,
    enum: [{
      label: '是',
      value: true
    }, {
      label: '否',
      value: false
    }]
  }, {
    type: 'button',
    version: '1.0',
    label: 'Submit',
    enum: [{
      type: 'submit',
      label: 'Submit',
      class: 'btn-info'
    }, {
      type: 'button',
      label: 'Cancel'
    }]
  }]
});
