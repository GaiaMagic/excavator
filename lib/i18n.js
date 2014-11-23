var dictionary = {
  zh: require('./i18n/backend.zh')
};

var defaultLang = 'en';

function translate (string, lang) {
  lang = lang || defaultLang;
  if (lang.length > 2) lang = defaultLang;
  var dict = dictionary[lang] || dictionary[defaultLang];
  if (typeof dict !== 'object') {
    return string;
  }
  return dict[string] || string;
}

function tr (string) {
  return string;
}

module.exports = {};
module.exports.translate = translate;
module.exports.tr = tr;
