var express = require ('express');
var app = module.exports = express ();
var path = require ('path');

app.set ('rootPath', __dirname);

var router = require ('./source/router');
var lobby = require ('./source/model/lobby.js');

// view engine setup
app.set ('views', path.join (__dirname, './source/view'));
app.set ('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// File Limitation
app.set ('MAX_FILE_SIZE', 30000000); // In Bytes, equals to 30Mb

//use router to handle different url request
app.use (router);

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
lobby.listen (server);
