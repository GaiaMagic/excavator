angular.module('excavator.misc', [
  'excavator.misc.timeago'
]).

constant('misc.hierarchies',
  require('./lib/hierarchies/hierarchies.js')).

constant('misc.general.validators', require('./models/general-validators.js')).

constant('misc.timeago', require('./lib/timeago.js')).

constant('misc.statuses', require('./models/status.js'));
