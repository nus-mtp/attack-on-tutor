var express = require ('express');
var app = module.exports = express ();
var fs = require ('fs');
var path = require ('path');


app.set ('rootPath', __dirname);

// parse config file
var config = JSON.parse (fs.readFileSync ('config.json', 'utf8'));
app.set ('server-ip', config['server-ip']);
app.set ('server-port', config['server-port']);
app.set ('api-key', config['api-key']);
app.set ('db-host', config['db-host']);
app.set ('db-dialect', config['db-dialect']);
app.set ('db-name', config['db-name']);
app.set ('db-username', config['db-username']);
app.set ('db-password', config['db-password']);
app.set ('jwt-secret', config['jwt-secret']);
app.set ('use-https', JSON.parse (config['use-https']));

var router = require ('./source/router');
var lobby = require ('./source/model/lobby.js');

// view engine setup
app.set ('views', path.join(__dirname, './source/view'));
app.set ('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
//app.use(express.static(path.join(__dirname + '/public')));

/*app.set('views', path.join(__dirname + '/public/views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');*/

// File Limitation
app.set ('MAX_FILE_SIZE', 30000000); // In Bytes, equals to 30Mb

var cookieParser = require ('cookie-parser');
var bodyParser = require ('body-parser');

app.use (bodyParser.json ());
app.use (bodyParser.urlencoded ({extended: false}));
app.use (cookieParser ());

//use router to handle different url request
app.use (router);

// Use this route for any GET request not already handled
/*app.get('*', function(req, res, next) {
	var err = new Error();
	err.status = 404;
	next(err);
});*/

//error handling
app.use(function (req, res, next) {
	var err = new Error ('Not Found');
	err.status = 404;
	next (err);

	if(err.status!=404) {
		return next();
	}
	
	console.log('404');
	//res.status(404);
	//res.send(err.message || '** no unicorns here **');
	res.redirect('/error');
	//res.render('error.html');
});

/*app.use(function(err, req, res, next) {
	// Logging a 500 (Internal Server Error)
	//log.error(err, req);
 
	// Error Printing
	console.log(err.stack);
 
	// send back a 500 with a generic message
	res.status(500);
	res.send('oops! something broke');
});*/
	
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
