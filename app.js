var express = require ('express');
var app = module.exports = express ();
var path = require ('path');
var mkdirp = require ('mkdirp');

app.set ('rootPath', __dirname);

// Create log folder
mkdirp
(
	'log',
	function (err)
	{
		if (err) console.error(err);
	}
);

var router = require ('./source/router');

// view engine setup
app.set ('env', 'development');
app.set ('views', path.join (__dirname, './source/views'));
app.set ('view engine', 'ejs');

// File Limitation
app.set ('MAX_FILE_SIZE', 30000000); // In Bytes, equals to 30Mb

//use router to handle different url request
app.use (router);

//error handling
app.use
(
	function (req, res, next)
	{
		var err = new Error ('Not Found');
		err.status = 404;
		next (err);
	}
);

// development error handler
// will print stacktrace
if (app.get ('env') === 'development') 
{
	app.use
	(
		function (err, req, res, next)
		{
			logger.error(err.message);
			res.status (err.status || 500);
			res.render
			(
				'error',
				{
					message: err.message,
					error: err
				}
			);
		}
	);
}

// production error handler
// no stacktraces leaked to user
app.use 
(
	function (err, req, res, next)
	{
		res.status (err.status || 500);
		res.render
		(
			'error',
			{
				message: err.message,
				error: {}
			}
		);
	}
);