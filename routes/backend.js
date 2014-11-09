var express = require('express');
var router = express.Router();
var needsTokenAuth = require('./token-auth')();

router.use('/admins', require('./admins'));
router.use('/forms', needsTokenAuth, require('./forms'));
router.use('/submissions', needsTokenAuth, require('./submissions'));

module.exports = router;
