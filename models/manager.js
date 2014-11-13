var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;

var makeUser = require('./user-alike');

var scheme = makeUser.scheme();

scheme.forms = [
  { type: Schema.ObjectId, ref: 'Form' }
];

module.exports = makeUser('Manager', scheme);
