var auth = require ('../auth');
var app = require ('../../app');

var protocol = 'https';
var usehttps = app.get('use-https');


if (!usehttps) {
	protocol = 'http';
}

/*
var get = function (req, res, next) {
	var auth = req.body.auth;
	if (auth.success) {
		res.redirect('/');
	}
	else res.redirect ('https://ivle.nus.edu.sg/api/login/?apikey=dQ52oB9BDUvIKSsyntdtW&url=http://google.com');
}
*/
var get = function (req, res, next) {
	res.redirect('https://ivle.nus.edu.sg/api/login/?apikey=' + app.get('api-key') + '&url=' + protocol + '://' + app.get ('server-ip') + ':' + app.get('server-port') + '/login/callback');
}

// Callback function fter IVLE login
var callback = function (req, res, next) {
	res.send('Login successful');
};

module.exports.get = get;
module.exports.callback = callback;