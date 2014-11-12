var express = require('express');
var router = express.Router();
var needsAdminAuth = require('./token-auth')({
  model: 'Admin'
});

router.use('/admins', require('./admins'));
router.use('/forms', needsAdminAuth, require('./forms'));
router.use('/submissions', needsAdminAuth, require('./submissions'));

router.use('/managers', require('./managers'));

module.exports = router;
