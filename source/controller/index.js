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
	var user = "Test";
	res.render
	(
		'index',
		{
			title: 'E-Tutorial - Login',
			user: user
		}
	);
}

module.exports.get = get;