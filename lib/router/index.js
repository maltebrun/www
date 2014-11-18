
var path = require('path');
var	merge = require('merge');
var fs = require('fs');
var express = require('express');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var less = require('less');

var async = require("async");
var asyncEachObject = require('async-each-object');

var chalk = require('chalk');

var ipbanner = require('../middleware/ipbanner/ipbanner.js');
var arbo = require('../../contents/arbo.json').values;
var sitemap = require('../middleware/sitemap/sitemap.js')(arbo);

//var views = require('../../contents/views.json').values;
var contents = require('../../contents/contents.json').values;

/*
var fields = {};
for (var id in contents) {
	if (contents[id].storage === "file") {
		fields[id] = require(path.join('..', '..', 'contents', contents[id].source)).data;
	}
	else if (contents[id].storage === "inline") {
		fields[id] = contents[id].data;
	}
	else if (contents[id].storage === "database") {
		fields[id] = "No database implemented yet.";
	};
};
*/

// Two dependencies, an Express HTTP server and a handler
module.exports = function (server, handler) {

	console.log('setting up constants...');

	for (var id in contents) {
		if (contents[id].storage === "file") {
			server.locals[id] = require(path.join('..', '..', 'contents', contents[id].source)).data;
		}
		else if (contents[id].storage === "inline") {
			server.locals[id] = contents[id].data;
		}
		else if (contents[id].storage === "database") {
			server.locals[id] = "No database implemented yet.";
		};
	};

	console.log('setting up routes...');

	server.use(function (req, res, next) {
		console.log(chalk.yellow("server.use at time : %s"), Date.now());
		next();
	});

	// Dynamically convert Less to CSS
	// http://bitdrift.com/post/1257013187/dynamic-css-rendering-in-express-with-less
	// https://github.com/less/less.js/issues/1987
	server.get("*.less", function(req, res, next) {
		fs.readFile(path.join(server.get('dirname'), 'public', req.url), 'utf8', function(err, data) {
			if (err) {
				console.log('error reading the less file : %s', req.url);
				next();
			} else {
				less.render(data, {paths: [path.join(server.get('dirname'), 'public', path.dirname(req.url))], compress : server.get('pretty')}, function(err, css) {
					if (err) {
						console.log('error rendering the less file : %s', req.url);
					} else {
						res.header("Content-type", "text/css");
						res.send(css);
					};
				});
			};
		});
	});

	server.use(favicon(path.join(server.get('dirname'), 'public', 'img', 'favicon.ico')));
	server.use(express.static(path.join(server.get('dirname'), 'public')));
	server.use(logger('dev'));
	server.use(bodyParser.json());
	server.use(bodyParser.urlencoded({extended: true}));
	server.use(cookieParser());
	server.use(ipbanner('off'));

	server.use(sitemap.breadcrumb);
	server.use(sitemap.currentitems);
	server.use(sitemap.headitems);
	server.use(sitemap.childitems);
	server.use(sitemap.fatheritems);

	server.use(function(req, res, next) {
		res.locals.maltebrun = "Le contenu de la variable maltebrun";
		next();
	});

	var root = express.Router();

	var handlers = {
		'log':
		function(params) {
			return function(req, res, next) {
				console.log(chalk.cyan(params));
				next();
			}
		},
		'render':
		function(page) {
			var contents = require(path.join('..', '..', 'contents', page.contents)).values;
			return function(req, res) {
				async.eachObject(
					contents,
					function(content, key, callback) {
						if (content.storage == "file") {
							fs.readFile(path.join(server.get('dirname'), 'public', 'contents', content.source), 'utf8', function (err, data) {
								res.locals[key] = data;
								callback();
							});
						} else if (content.storage == "database") {
							callback();
						} else {
							callback();
						};
					},	
					function(err) {
						if (!err) {
							res.render(path.join(server.get('dirname'), 'views', page.jade));
						} else {
							//res.render('error');
							console.log("Erreur sur lecture des fichiers statiques");
							throw err;
						};
					}
				);
			}
		}
	};

	for (var i = 0, n = arbo.length; i < n; i++) {
		// get an instance of router
		root.route(sitemap.arbo[i].fullroute)
		.all(
			handlers.log("root.route(" + sitemap.arbo[i].fullroute + ").all at time : " + Date.now())
		)
		// route
		.get(
			handlers.render(sitemap.arbo[i])
		);
	}
/*
	// get an instance of router
	root.route('/')
	.all(
		handlers.log(chalk.yellow("root.route(/).all at time : ") + Date.now())
	)
	// home page route
	.get(
		handlers.render("home", views, fields)
	);

	// get an instance of router
	root.route('/activities')
	.all(
		handlers.log(chalk.yellow("root.route(/activities).all at time:") + Date.now())
	)
	// home page route
	.get(
		handlers.render("activities", views, fields)
	);

	// get an instance of router
	root.route('/companie')
	.all(
		handlers.log(chalk.yellow("root.route(/companie).all at time:") + Date.now())
	)
	// home page route
	.get(
		handlers.render("companie", views, fields)
	);

// get an instance of router
	root.route('/companie/level_1_2_1')
	.all(
		handlers.log(chalk.yellow("root.route(/companie/level_1_2_1).all at time:") + Date.now())
	)
	// home page route
	.get(
		handlers.render("level_1_2_1", views, fields)
	);
*/
	server.use('/', root);



	var goulas = express.Router();

	goulas.route('/')
	.all(function(req, res, next) {
		console.log(chalk.yellow("goulas.route(/).all at time : %s"), Date.now());
		next();
	})
	// home page route
	.get(function(req, res) {
		res.send('hi, im the goulas home page!');	
	})
	;

	// apply the routes to the server
	server.use('/goulas', goulas);

	/// catch 404 and forward to error handler
	server.use(function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	/// error handlers

	// development error handler
	// will print stacktrace
	if (server.get('env') === 'development') {
		server.use(function(err, req, res, next) {
			res.status(err.status || 500);
			res.render(path.join(server.get('dirname'), 'views', 'error'), {
				message: err.message,
				error: err
			});
		});
	}

	// production error handler
	// no stacktraces leaked to user
	server.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render(path.join(server.get('dirname'), 'views', 'error'), {
			message: err.message,
			error: {}
		});
	});
};
