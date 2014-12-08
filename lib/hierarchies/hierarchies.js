module.exports = [
  {
    group: 'Presets',            /* tr('hierarchy::_::Presets') */
    name: 'china-districts',
    label: 'Districts of China', /* tr('hierarchy::DoC::Districts of China') */
    location: '/hierarchies/china-districts.json',
    require: './china-districts.json',
    i18nPrefix: 'hierarchy::DoC::',
    data: [
      {
        model: 'province',
        label: 'Province'        /* tr('hierarchy::DoC::Province') */
      }, {
        model: 'city',
        label: 'City'            /* tr('hierarchy::DoC::City') */
      }, {
        model: 'district',
        label: 'District'        /* tr('hierarchy::DoC::District') */
      }
    ]
  },
  {
    group: 'Presets',            /* tr('hierarchy::_::Presets') */
    name: 'operating-systems',
    label: 'Operating Systems',  /* tr('hierarchy::OS::Operating Systems') */
    location: '/hierarchies/operating-systems.json',
    require: './operating-systems.json',
    i18nPrefix: 'hierarchy::OS::',
    data: [
      {
        model: 'brand',
        label: 'Brand'           /* tr('hierarchy::OS::Brand') */
      }, {
        model: 'type',
        label: 'Type'            /* tr('hierarchy::OS::Type') */
      }, {
        model: 'system',
        label: 'System'          /* tr('hierarchy::OS::System') */
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

module.exports.findByName = findByName;

function requireHierarchy (input) {
  var hierarchy = findByName(input);
  if (!hierarchy) return;

  // require for the front-end application
  // the best way to do this is to use hierarchies' get method,
  // which would be using the promise, but using promise here means
  // to rewrite most of the related code, so we would use cache only
  if (typeof angular === 'object') {
    var injector = angular.element(document.body).injector();
    var hierarchies = injector.get('hierarchies');
    return hierarchies.cached[hierarchy.location];
  }

  return require(hierarchy.require);
}

module.exports.require = requireHierarchy;
