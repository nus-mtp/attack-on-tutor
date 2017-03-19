/**
 * Router
 * @type {*|exports|module.exports}
 */
var express = require ('express');
var router = express.Router ();

var auth = require('./auth');
var index = require ('./controller/index');
var lobby = require ('./controller/lobby');
var login = require ('./controller/login');
var dashboard = require('./controller/dashboard');

router.get ('/lobby/:moduleId/:tutorialId', auth.ensureAuth, lobby.enterLobby, lobby.get);
router.post ('/lobby/:moduleId/:tutorialId', auth.ensureAuth, lobby.enterLobby, lobby.get);

router.get ('/', auth.ensureAuth, index.get);
router.get ('/login', auth.ensureAuth, login.get);
router.get ('/login/callback', login.callback);

router.get ('/dashboard', auth.ensureAuth, dashboard.get);

router.post('/api/dashboard/forceSyncIVLE', auth.ensureAuth, dashboard.forceSyncIVLE);
router.post('/api/dashboard/getTutorials', auth.ensureAuth, dashboard.getTutorials);

router.post('/api/lobby/enterLobby', auth.ensureAuth, lobby.enterLobby);
router.post('/api/lobby/getUsersInTutorial', auth.ensureAuth, lobby.getUsersInTutorial);

module.exports = router;