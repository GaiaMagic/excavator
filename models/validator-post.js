function postValidate (schemes, data) {
  for (var i = 0; i < schemes.length; i++) {
    var scheme = schemes[i];
    if (scheme.type === 'file') {
      var fileData = data[scheme.model];
      var saveAsImage = require('../lib/image').saveFileAsUserContent;
      data[scheme.model] = saveAsImage(fileData);
    }
  }
}

module.exports = postValidate;
