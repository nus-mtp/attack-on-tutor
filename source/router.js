/**
 * Router
 * @type {*|exports|module.exports}
 */
var express = require ('express');
var router = express.Router ();

var index = require ('./controllers/index');

router.get ('/', index.get);

module.exports = router;