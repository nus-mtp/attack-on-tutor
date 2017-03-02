/**
 * Router
 * @type {*|exports|module.exports}
 */
var express = require ('express');
var router = express.Router ();

var auth = require('./auth');
var index = require ('./controller/index');
var login = require ('./controller/login');
var dashboard = require('./controller/dashboard');

router.get ('/', auth.ensureAuth, index.get);
router.get ('/login', auth.ensureAuth, login.get);
router.get ('/login/callback', login.callback);

router.get ('/dashboard', auth.ensureAuth, dashboard.get);

module.exports = router;