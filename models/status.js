var STATUSES = [
  {
    id:      0,
    enabled: true,
    type:    'default',
    label:   'Undecided'
  }, {
    id:      1,
    enabled: false,
    type:    'primary',
    label:   'Unknown'
  }, {
    id:      2,
    enabled: true,
    type:    'success',
    label:   'Passed'
  }, {
    id:      3,
    enabled: false,
    type:    'info',
    label:   'Unknown'
  }, {
    id:      4,
    enabled: true,
    type:    'warning',
    label:   'Pending'
  }, {
    id:      5,
    enabled: true,
    type:    'danger',
    label:   'Rejected'
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
