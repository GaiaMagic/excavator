module.exports = {};
module.exports.dictionary = {
  zh: require('./i18n/backend.zh')
};
module.exports.defaultLang = 'en';
module.exports.translate = translate;
module.exports.tr = tr;

function find (string, lang) {
  if (!string) return '';
  var defaultLang = module.exports.defaultLang;
  lang = lang || defaultLang;
  if (lang.length > 2) lang = defaultLang;

  var dictionary = module.exports.dictionary;
  var dict = dictionary[lang] || dictionary[defaultLang];

  var parts = string.split('::');
  var l = parts.length;
  var def = parts[l - 1];
  var current = dict;

  for (var i = 0; i < l + 1; i++) {
    if (typeof current === 'undefined') return def;
    if (typeof current === 'string') {
      return current || def;
    }
    if (i === l) return def;
    current = current[parts[i]];
  }
}

/**
 * translate string with language code and context
 * @param  {string} string  the input string, use {{ and }} for template
 *                          if string is an object, it must look like this:
 *                          { string: 'string', context: { ... } }, then the
 *                          following context argument will be ignored
 * @param  {string} lang    the language code like en, zh
 * @param  {object} context values to put in the template
 * @return {string}         translated string will be returned
 */
function translate (string, lang, context) {
  if (typeof string === 'object') {
    if (typeof string.context === 'object') {
      context = string.context;
    }
    if (typeof string.string === 'string') {
      string = string.string;
    } else {
      string = '';
    }
  }
  string = find(string, lang);
  if (typeof context === 'object') {
    var start;
    var end;
    var keys = Object.keys(context);
    var func = 'return function (' + keys.join(',') + ') { return ';
    var vals = keys.map(function (key) {
      return context[key];
    });
    var ret;
    while (
      (start = string.indexOf('{{')) > -1 &&
      (end = string.indexOf('}}', start)) > -1
    ) {
      if (typeof ret !== 'string') ret = '';
      var expr = func + string.substring(start + 2, end) + '; }';
      var val;
      try {
        val = new Function(expr)().apply(undefined, vals);
        if (typeof val === 'undefined') throw undefined;
        if (typeof val !== 'string') val = JSON.stringify(val);
      } catch (e) {
        val = string.substring(start, end + 2);
      }
      ret += string.substring(0, start) + val;
      string = string.substring(end + 2);
    }
    ret += string;
    if (typeof ret !== 'string') ret = string;
    return ret;
  }
  return string;
}

function tr (string, context) {
  if (typeof context === 'object') {
    return {
      string: string,
      context: context
    };
  }
  return string;
}
