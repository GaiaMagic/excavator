angular.module('excavator.misc', [
  'excavator.misc.timeago',
  'excavator.misc.async'
]).

constant('misc.bytes', require('./lib/bytes.js')).

constant('misc.hierarchies',
  require('./lib/hierarchies/hierarchies.js')).

constant('misc.general.validators', require('./models/general-validators.js')).

constant('misc.timeago', require('./lib/timeago.js')).

constant('misc.template.filetypes', require('./models/tpl-types.js')).

constant('misc.statuses', require('./models/status.js'));
