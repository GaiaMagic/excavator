var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var Q            = require('q');
var FormRevision = require('./form-revision');
var panic        = require('../lib/panic');
var tr           = require('../lib/i18n').tr;
var validate     = require('./validator');
var postProcess  = require('./validator-post');
var http         = require('http');

var submissionSchema = new Schema({
  form:                { type: Schema.ObjectId, ref: 'Form' },
  form_index:          { type: Number, default: 0 },
  form_revision:       { type: Schema.ObjectId, ref: 'FormRevision' },
  form_revision_index: { type: Number, default: 0 },
  data:                { type: Object },
  status:              { type: Number, default: 0 },
  ip_address:          { type: String },
  ip_address_info:     { country: String, province: String, city: String, district: String },
  user_agent:          { type: String },
  created_at:          { type: Date, default: Date.now }
});

submissionSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(panic(422, {
      type:    'submission-not-allowed-to-edit',
      message: tr('Submission should not be edited.')
    }));
  }

  var net = require('net');
  if (typeof this.ip_address !== 'string' || !net.isIP(this.ip_address)) {
    this.ip_address = '';
  }

  if (typeof this.user_agent !== 'string') {
    this.user_agent = '';
  }

  var self = this;
  FormRevision.findById(this.form_revision).populate('parent').
  exec(function (err, formRev) {
    if (err || !formRev) return next(panic(422, {
      type:    'invalid-form',
      message: tr('The form is invalid.')
    }));
    self.form = formRev.parent._id;
    self.form_index = formRev.parent.submissions;
    self.form_revision_index = formRev.submissions;

    if (formRev.parent.published !== true) return next(panic(422, {
      type:    'unpublished-form',
      message: tr('The form is not yet published.')
    }));

    try {
      var data = self.data;
      if (typeof data === 'string') data = JSON.parse(data);
      var schemes = JSON.parse(formRev.content).scheme;
      var errorMsgs = validate(schemes, data);
      if (errorMsgs.length > 0) {
        return next(panic(422, {
          type: 'validation-failed',
          messages: errorMsgs
        }));
      }
      postProcess(schemes, data);
    } catch (e) {
      console.error(e.stack);
      return next(panic(422, {
        type: 'parse-error',
        message: tr('Unable to process data for now.')
      }));
    }

    next();
  });
});

submissionSchema.pre('remove', function (next) {
  next(panic(422, {
    type:    'submission-not-allowed-to-delete',
    message: tr('Submission should not be deleted.')
  }));
});

submissionSchema.post('save', function (submission) {
  var Submission = this.constructor;
  Submission.populate(submission, [
    { path: 'form' },
    { path: 'form_revision' }
  ], function (err, submission) {
    var op = { $inc: { submissions: 1 }};
    var log = function (err) {
      if (err) console.error(err);
    };
    submission.form.update(op, log);
    submission.form_revision.update(op, log);
    submission.getIPInfo();
  });
});

submissionSchema.method('Save', function () {
  var deferred = Q.defer();
  var self = this;
  self.save(function (err) {
    if (err) {
      if (!err.panic) {
        err = panic(500, {
          type:    'internal-server-error',
          message: tr('Unexpected server error was encountered.')
        });
      }
      return deferred.reject(err);
    }
    deferred.resolve(self);
  });
  return deferred.promise;
});

function getIPInfo (ip) {
  var deferred = Q.defer();
  var req = http.request({
    host: 'int.dpool.sina.com.cn',
    port: 80,
    path: '/iplookup/iplookup.php?format=json&ip=' + ip,
    method: 'GET'
  }, function (res) {
    var body = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      try {
        var info = JSON.parse(body);
        var ret = {};
        ret[ip] = {
          country: info['country'] || '-',
          province: info['province'] || '-',
          city: info['city'] || '-',
          district: info['district'] || '-'
        };
        deferred.resolve(ret);
      } catch (err) {
        deferred.resolve({
          country: '-',
          province: '-',
          city: '-',
          district: '-'
        });
      }
    });
  });
  req.on('error', function (err) {
    deferred.reject(err);
  });
  req.end();
  return deferred.promise;
}

submissionSchema.method('getIPInfo', function () {
  if (this.ip_address_info.country) {
    var ret = {};
    ret[this.ip_address] = this.ip_address_info;
    return Q(ret);
  }
  var self = this;
  return getIPInfo(this.ip_address).then(function (info) {
    var ip = info[self.ip_address];
    var Submission = module.exports;
    Q.nbind(Submission.findByIdAndUpdate, Submission)(self._id, {
      'ip_address_info.country': ip.country || '-',
      'ip_address_info.province': ip.province || '-',
      'ip_address_info.city': ip.city || '-',
      'ip_address_info.district': ip.district || '-'
    }).catch(function (e) {
      console.error(e)
    });
    return info;
  });
});

submissionSchema.static('submit', function (formRevId, data, userInfo) {
  var self = this;
  userInfo = userInfo || {};
  var newsubmission = new self({
    form_revision: formRevId,
    data: data,
    ip_address: userInfo.ipAddress,
    user_agent: userInfo.userAgent
  });
  var deferred = Q.defer();
  newsubmission.save(function (err) {
    if (err) {
      return deferred.reject(err);
    }
    deferred.resolve(newsubmission);
  });
  return deferred.promise;
});

var model;

if (mongoose.models.Submission === undefined) {
  model = mongoose.model('Submission', submissionSchema);
} else {
  model = mongoose.model('Submission');
}

module.exports = model;
