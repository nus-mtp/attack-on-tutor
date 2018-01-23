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
var error = require('./controller/error');
var test = require('./testing/database/test.js');

router.get ('/lobby/:moduleId/:tutorialId', auth.ensureAuth, lobby.enterLobby, lobby.get);
router.post ('/lobby/:moduleId/:tutorialId', auth.ensureAuth, lobby.enterLobby, lobby.get);

router.get ('/', auth.ensureAuth, index.get);
//IVLE login.
router.get ('/ivlelogin', auth.ensureAuth, login.ivleGet);
router.get ('/ivlelogin/callback', login.ivleCallback);
//Non-IVLE logins.
router.get ('/login/:userId/:hash', auth.ensureAuth, login.get);

router.get ('/dashboard', auth.ensureAuth, dashboard.get);

router.get ('/error',
	function (req, res, next)
	{
		var errorMessage = "You Cannot Just Access the Error Page Manually! (E3)";
		
		res.render('error.ejs', {
			errorMessage: errorMessage
		});
	}
);

router.post('/api/dashboard/forceSyncIVLE', auth.ensureAuth, dashboard.forceSyncIVLE);
router.post('/api/dashboard/getTutorials', auth.ensureAuth, dashboard.getTutorials);
router.post('/api/dashboard/syncUser', auth.ensureAuth, dashboard.syncUser);
router.post('/api/dashboard/getUserInfo', auth.ensureAuth, dashboard.getUserInfo);
router.post('/api/dashboard/getTopUsers', auth.ensureAuth, dashboard.getTopUsers);

router.post('/api/lobby/enterLobby', auth.ensureAuth, lobby.enterLobby);
router.post('/api/lobby/getUsersInTutorial', auth.ensureAuth, lobby.getUsersInTutorial);

router.get('/test', auth.ensureAuth, test.get);

module.exports = router;