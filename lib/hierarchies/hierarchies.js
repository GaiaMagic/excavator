module.exports = [
  {
    name: 'china-districts',
    label: 'Districts of China',
    location: '/hierarchies/china-districts.json',
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
