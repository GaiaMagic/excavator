angular.module('excavator.misc', []).

constant('misc.hierarchies',
  require('./lib/hierarchies/hierarchies.js')).

constant('misc.statuses', require('./models/status.js'));
