/**
 * Router
 * @type {*|exports|module.exports}
 */
var express = require ('express');
var router = express.Router ();

var index = require ('./controller/index');
var lobby = require ('./controller/lobby');

router.get ('/', index.get);
router.get ('/lobby/:userId/:moduleId/:tutorialId', lobby.get);

module.exports = router;