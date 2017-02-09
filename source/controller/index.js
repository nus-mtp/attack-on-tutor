/**
 * @module controllers/index
 * @type {*|exports|module.exports}
 */

/**
 * Default index page
 * return HTML
 * @param req
 * @param res
 * @param next
 */
var get = function (req, res, next)
{
	var auth = req.body.auth;
	var user;
	if (auth.success)
	{
		//console.log(auth);
		user = auth.decoded;
	}
	res.render
	(
		'index',
		{
			title: 'E-Tutorial - Login',
			user: user,
			ip: req.app.get("server-ip"),
			port: req.app.get("server-port")
		}
	);
}

module.exports.get = get;