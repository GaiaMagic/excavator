module.exports = function (tr) {
  return [
    {
      name: 'chinese-mobile',
      label: tr('forms::Chinese mobile phone number'),
      value: 'typeof data === "string" && data.length === 11 && ' +
        '/^1[3-8][0-9]{9}$/.test(data)',
      say: tr('forms::be a valid 11-digit Chinese mobile phone number')
    },
    {
      name: 'phone-number',
      label: tr('forms::Phone number'),
      value: 'typeof data === "string" && data.length >= 3 && ' +
        'data.length <= 30 && /^[0-9\\(\\)\\/\\+\\s\\-]*$/.test(data)',
      say: tr('forms::be a valid 3-30 digtis phone number')
    },
    {
      // https://github.com/jzaefferer/jquery-validation/blob/master/src/core.js
      name: 'email-address',
      label: tr('forms::Email address'),
      value: 'typeof data === "string" && data.length <= 100 && ' +
        '/^[a-zA-Z0-9.!#$%&\'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:' +
        '[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:' +
        '[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(data)',
      say: tr('forms::be a valid Email address')
    },
    {
      // https://gist.github.com/dperini/729294
      name: 'url',
      label: tr('forms::URL'),
      value: 'typeof data === "string" && data.length <= 1024 && ' +
        '/^(?:(?:https?|ftp):\\/\\/)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)' +
        '(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
        '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|' +
        '1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5]))' +
        '{2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z' +
        '\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z' +
        '\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z' +
        '\\u00a1-\\uffff]{2,})))(?::\\d{2,5})?(?:\\/\\S*)?$/i.test(data)',
      say: tr('forms::be a valid URL')
    },
    {
      // https://gist.github.com/ShirtlessKirk/2134376
      name: 'credit-card',
      label: tr('forms::Credit card number (Luhn validation)'),
      value: [
        '(function luhnChk (luhn) {',
        '  if (typeof luhn !== "string") return false;',
        '  var len = luhn.length, mul = 0, sum = 0;',
        '  var prodArr = [',
        '    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],',
        '    [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]',
        '  ];',
        '  while (len--) {',
        '    sum += prodArr[mul][parseInt(luhn.charAt(len), 10)];',
        '    mul ^= 1;',
        '  }',
        '  return sum % 10 === 0 && sum > 0;',
        '})(data)'
      ].join('\n'),
      say: tr('forms::be a valid credit card number')
    },
    {
      name: 'resident-id',
      label: tr('forms::Resident ID Card'),
      value: 'typeof data === "string" && data.length === 18 && ' +
        '/^[0-9]{17}[0-9Xx]$/.test(data)',
      say: tr('forms::be a valid 18-digit resident ID card number')
    }
  ];
};
