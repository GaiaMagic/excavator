function ExcavatorError (status, details) {
  this.status  = status;
  this.type    = details.type;
  this.message = details.message;
}

ExcavatorError.prototype = new Error;

module.exports = ExcavatorError;
