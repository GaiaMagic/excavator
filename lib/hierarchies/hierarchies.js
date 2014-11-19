module.exports = [
  {
    name: 'china-districts',
    label: 'Districts of China',
    location: '/hierarchies/china-districts.json',
    require: './china-districts.json',
    data: [
      {
        model: 'province',
        label: 'Province'
      }, {
        model: 'city',
        label: 'City'
      }, {
        model: 'district',
        label: 'District'
      }
    ]
  },
  {
    name: 'operating-systems',
    label: 'Operating Systems',
    location: '/hierarchies/operating-systems.json',
    require: './operating-systems.json',
    data: [
      {
        model: 'brand',
        label: 'Brand'
      }, {
        model: 'type',
        label: 'Type'
      }, {
        model: 'system',
        label: 'System'
      }
    ]
  }
];

function findByName (input) {
  if (typeof input !== 'string' || input.length === 0) return;
  for (var i = 0; i < module.exports.length; i++) {
    if (module.exports[i].name === input) {
      return module.exports[i];
    }
  }
  return;
}

function requireHierarchy (input) {
  var hierarchy = findByName(input);
  if (!hierarchy) return;
  return require(hierarchy.require);
}

module.exports.require = requireHierarchy;
