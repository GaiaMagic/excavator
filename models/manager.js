var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;
var Q          = require('q');

var makeUser = require('./user-alike');

var scheme = makeUser.scheme();

scheme.forms = [
  { type: Schema.ObjectId, ref: 'Form' }
];

function modify (managerSchema) {
  managerSchema.post('remove', function (manager) {
    var Form = require('./form'); // put it here to prevent circular dependency
    Q.nbind(Form.populate, Form)(manager, { path: 'forms' }).
    then(function (manager) {
      return Q.all(manager.forms.map(function (form) {
        return form.countManagers(true);
      }));
    });
  });
}

module.exports = makeUser('Manager', scheme, modify);
