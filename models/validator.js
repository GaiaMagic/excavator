var vm         = require('vm');
var tr         = require('../lib/i18n').tr;
var undecorate = require('../lib/decorate').undecorate;
var Schemes    = require('./schemes');

var TIMEOUT = 100;

/**
 * validate data with given schemes
 * @param  {array}  schemes array of schemes
 * @param  {object} data    the data
 * @return {array}          array of error messages to be used with translate
 */
function validate (schemes, data) {
  var errorMsgs = [];
  var serverScheme;

  for (var i = 0; i < schemes.length; i++) {
    var scheme = schemes[i];

    serverScheme = Schemes[scheme.type];
    if (typeof serverScheme !== 'object') {
      errorMsgs.push(tr('Scheme "{{type}}" does not exist.', {
        type: scheme.type
      }));
      continue;
    }

    serverScheme = serverScheme[scheme.version];
    if (typeof serverScheme !== 'object') {
      errorMsgs.push(tr('Scheme "{{type}}" with version "{{version}}" ' +
      'does not exist.', {
        type: scheme.type,
        version: scheme.version
      }));
      continue;
    }

    var validator = scheme.validator;
    var validatorMessage = scheme.validatorMessage;

    if (typeof scheme.validator === 'string' && scheme.validator) {
      validator = undecorate(scheme.validator);
      if (typeof validator !== 'function') {
        try {
          validator = new Function('data', 'return ' + scheme.validator.trim());
        } catch (e) {
          errorMsgs.push(tr('Unable to validate "{{label}}".', {
            label: scheme.label }));
          continue;
        }
      }
    }
    if (typeof validator !== 'function') {
      validator = serverScheme.validator;
      validatorMessage = validatorMessage || serverScheme.validatorMessage;
    }
    if (typeof validator !== 'function') {
      continue;
    }

    var errMsgs;
    try {
      errMsgs = callValidator(validator, validatorMessage, scheme, data);
    } catch (e) {
      if (e.message.indexOf('timed out') > -1) {
        errMsgs = [ tr('Timed out validating "{{label}}". ' +
          'It may contain infinite loop.', { label: scheme.label }) ];
      } else {
        errMsgs = [ tr('Unable to validate "{{label}}".', {
            label: scheme.label }) ];
      }
    }
    errorMsgs = errorMsgs.concat(errMsgs);
  }

  return errorMsgs;
}

/**
 * if validatorFunction has no or one argument, then only the value is passed.
 * if validatorFunction two or more argument, then the current scheme and
 * the data object that contains all the data will be passed.
 * Array of error message is returned and an empty array is returned if there
 * are no errors validating the data.
 */
function callValidator(validatorFunction, validatorMessage, scheme, data) {
  if (validatorFunction.length <= 1) {
    var value = data[scheme.model];
    var expr = '(' + validatorFunction.toString() + ')(value)';
    var ret = vm.runInNewContext(expr, { value: value }, { timeout: TIMEOUT });
    if (typeof ret === 'function') {
      return callValidator(ret, validatorMessage, scheme, data);
    }
    if (ret !== true) {
      return [
        tr('Item "{{label}}" should {{msg}}.', {
          label: scheme.label,
          msg: validatorMessage
        })
      ];
    }
  } else {
    var expr = '(' + validatorFunction.toString() + ')';
    expr += '.call({ tr: tr }, scheme, data)';
    var ret = vm.runInNewContext(expr, {
      scheme: scheme, data: data, tr: tr
    }, { timeout: TIMEOUT });
    if (typeof ret !== 'object' ||
        typeof ret.result === 'undefined') {
      throw new Error('it should return an object containing result');
    }
    if (ret.result !== true) {
      return ret.errorMsgs;
    }
  }
  return [];
}

module.exports = validate;
