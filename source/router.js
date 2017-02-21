/**
 * Router
 * @type {*|exports|module.exports}
 */
var express = require ('express');
var router = express.Router ();

var index = require ('./controller/index');
var login = require ('./controller/login');


router.get ('/', index.get);

router.get ('/login', login.get);
router.get ('/login/callback', login.callback);

module.exports = router;