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
	res.render
	(
		'test',
		{
			title: 'Error Page'
		}
	);
}

module.exports.get = get;