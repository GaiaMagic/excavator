angular.module('excavator.misc', []).

constant('misc.hierarchies',
  require('./lib/hierarchies/hierarchies.js')).

constant('misc.general.validators', require('./models/general-validators.js')).

constant('misc.statuses', require('./models/status.js'));
