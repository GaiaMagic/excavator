var express = require('express');
var router = express.Router();
var needsAdminAuth = require('./token-auth')({
  model: 'Admin'
});

router.use('/admins', require('./admins'));
router.use('/forms', needsAdminAuth, require('./forms'));
router.use('/submissions', needsAdminAuth, require('./submissions'));
router.use('/templates', needsAdminAuth, require('./templates'));

router.use('/managers', require('./managers'));

router.use('/misc', require('./misc'));

router.all('*', function (req, res, next) {
  next('not-found');
});

module.exports = router;
