var STATUSES = [
  {
    id:      0,
    enabled: true,
    type:    'default',
    label:   'Undecided' /* tr('subs::statuses::Undecided') */
  }, {
    id:      1,
    enabled: false,
    type:    'primary',
    label:   'Unknown'   /* tr('subs::statuses::Unknown') */
  }, {
    id:      2,
    enabled: true,
    type:    'success',
    label:   'Passed'    /* tr('subs::statuses::Passed') */
  }, {
    id:      3,
    enabled: false,
    type:    'info',
    label:   'Unknown'   /* tr('subs::statuses::Unknown') */
  }, {
    id:      4,
    enabled: true,
    type:    'warning',
    label:   'Pending'   /* tr('subs::statuses::Pending') */
  }, {
    id:      5,
    enabled: true,
    type:    'danger',
    label:   'Rejected'  /* tr('subs::statuses::Rejected') */
  }
];

module.exports = STATUSES.filter(function (status) {
  return status.enabled;
});
module.exports.findById = findById;

function findById (input) {
  if (typeof input !== 'string' && typeof input !== 'number') return;
  input = parseInt(input);
  for (var i = 0; i < STATUSES.length; i++) {
    if (STATUSES[i].id === input) {
      if (!STATUSES[i].enabled) {
        return;
      }
      return STATUSES[i];
    }
  }
  return;
}
