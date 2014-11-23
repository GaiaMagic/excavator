angular.module('excavator.i18n.dictionary', []).

factory('i18n.dictionary', [
  'i18n.dictionary.all',
  function (all) {
  return function (lang) {
    return all[lang];
  };
}]).

constant('i18n.dictionary.all', {
  zh: require('./lib/i18n/dictionary.manager.zh.json')
});
