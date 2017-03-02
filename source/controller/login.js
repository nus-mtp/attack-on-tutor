var rest = require ('rest');
var auth = require ('../auth');
var app = require ('../../app');
var User = require ('../models/User');
var protocol = 'https';
var usehttps = app.get('use-https');

var ivleToken;

if (!usehttps) {
	protocol = 'http';
}

var get = function (req, res, next) {
	var auth = req.body.auth;
	if (auth.success) {
		res.redirect('/');
	}
	res.redirect('https://ivle.nus.edu.sg/api/login/?apikey=' + app.get('api-key') + '&url=' + protocol + '://' + app.get ('server-ip') + ':' + app.get('server-port') + '/login/callback');
}

// Callback function fter IVLE login
var callback = function (req, res, next) {
	var ivleToken = req.query.token;
	var apikey = app.get ('api-key');

	console.log('https://ivle.nus.edu.sg/api/Lapi.svc/Profile_View?APIKey=' + apikey + '&AuthToken=' + ivleToken);

	//view profile
	rest ('https://ivle.nus.edu.sg/api/Lapi.svc/Profile_View?APIKey=' + apikey + '&AuthToken=' + ivleToken).then (function (response) {

		var result = JSON.parse (response.entity).Results[0];

		if (result != undefined) {
			result.Token = ivleToken;

			User.findOne({
				where:{
					id: result.UserID
				}
			}).then(function(user){
				if (!user){
					User.create({
						id: result.UserID,
						name: result.Name,
						email: result.Email,
						gender: result.Gender,
						token: result.Token,
					}).then(function(user){
						var authToken = auth.setAuth (result.UserID, result.Name);
						//logger.info(result.UserID + ' created user');
						//return res.redirect (app.get('server-ip') + ':' + app.get('server-port'), {token: authToken});
						return res.redirect (protocol + '://' + app.get ('server-ip') + ':' + app.get('server-port'), {token: authToken});
					}).catch(function(err){
						//logger.error(result.UserID + ' create user failed');
						return res.json({success:false, at:'Create user', message:err});
					});
				} else {
					User.update({
						token: result.Token
					},{
						where:{
							id:result.UserID
						}
					}).then(function(user){
						// TODO: integrate auth
						var authToken = auth.setAuth (result.UserID, result.Name);
						//logger.info(result.UserID + ' updated user information');
						return res.redirect (protocol + '://' + app.get ('server-ip') + ':' + app.get('server-port'), {token: authToken});
					}).catch(function(err){
						//logger.error(result.UserID + ' update user information failed');
						console.log(err.stack);
						return res.json({success:false, at:'Update user information', message:err});
					});
				}
			});
		}
		else {
			//logger.error('Sync IVLE user information failed, cannot resolve IVLE information');
			return res.json({success: false, at:'Sync IVLE user information', message:'cannot resolve IVLE information'});
		}
	}).catch(function(err){
		//logger.error('Sync IVLE user information failed, cannot connect IVLE');
		console.log(err);
		return res.json({success: false, at:'Sync IVLE user information', message:'cannot connect IVLE'});
	})
};

module.exports.get = get;
module.exports.callback = callback;