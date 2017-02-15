var express = require ('express');
var app = module.exports = express ();
var path = require ('path');

app.set ('rootPath', __dirname);

var router = require ('./source/router');

// view engine setup
app.set ('views', path.join (__dirname, './source/view'));
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

var server = app.listen
(
	8081,
	function ()
	{
		var host = server.address().address
		var port = server.address().port

		console.log("App listening at http://%s:%s", host, port)
	}	
)