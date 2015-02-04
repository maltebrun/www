
var path = require('path');
var	merge = require('merge');
var fs = require('fs');
var express = require('express');
var jf = require('jsonfile');
var util = require('util');

var favicon = require('serve-favicon');
//var logger = require('morgan');
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
			server.locals[id] = require(path.join(server.get('dirname'), 'contents', contents[id].source)).data;
		}
		else if (contents[id].storage === "inline") {
			server.locals[id] = contents[id].data;
		}
		else if (contents[id].storage === "database") {
			server.locals[id] = "No database implemented yet.";
		};
	};

	console.log('setting up routes...');

	//server.use(function (req, res, next) {
	//	console.log(chalk.yellow("server.use at time : %s"), Date.now());
	//	next();
	//});

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
	server.use(bodyParser.json());
	server.use(bodyParser.urlencoded({extended: true}));
	server.use(cookieParser());
	server.use(ipbanner('off'));

	server.use(sitemap.breadcrumb);
	server.use(sitemap.currentitems);
	server.use(sitemap.headitems);
	server.use(sitemap.childitems);
	server.use(sitemap.fatheritems);
	server.use(sitemap.mainmenu);

	server.use(function(req, res, next) {
		res.locals.maltebrun = "Le contenu de la variable maltebrun";
		next();
	});

	var root = express.Router();

	var handlers = {
		'log':
		function(params) {
			return function(req, res, next) {
				console.log(chalk.cyan(params + Date.now()));
				next();
			}
		},
		'render':
		function(page) {
			var contents = require(path.join(server.get('dirname'), 'contents', page.contents)).values;
			return function(req, res) {
				async.eachObject(
					contents,
					function(content, key, callback) {
						if (content.type == "libel") {
							if (content.storage == "inline") {
								res.locals[key] = content.data;
								callback();
							} else if (content.storage == "file") {
								jf.readFile(path.join(server.get('dirname'), 'data', content.source), function(err, data) {
									res.locals[key] = data.values;
									callback();
								});
							} else if (content.storage == "directory") {
								callback();
							} else if (content.storage == "database") {
								callback();
							} else {
								callback();
							};
						} else if (content.type == "article") {
							if (content.storage == "inline") {
								res.locals[key] = content.data;
								callback();
							} else if (content.storage == "file") {
								jf.readFile(path.join(server.get('dirname'), 'data', content.source), function(err, data) {
									res.locals[key] = data.values;
									callback();
								});
							} else if (content.storage == "directory") {
								callback();
							} else if (content.storage == "database") {
								callback();
							} else {
								callback();
							};
						} else if (content.type == "thumbnails") {
							if (content.storage == "inline") {
								res.locals[key] = content.data;
								callback();
							} else if (content.storage == "file") {
								callback();
							} else if (content.storage == "directory") {
								callback();
							} else if (content.storage == "database") {
								callback();
							} else {
								callback();
							};
						} else if (content.type == "news") {
							if (content.storage == "inline") {
							} else if (content.storage == "file") {
								callback();
							} else if (content.storage == "directory") {
								//console.log(path.join(server.get('dirname'), 'data', content.source));
								fs.readdir(path.join(server.get('dirname'), 'data', content.source), function(err, files) {
									if (!err) {
										res.locals[key] = [];
										async.eachObject(
											files,
											function(file, subkey, callback) {
												jf.readFile(path.join(server.get('dirname'), 'data', content.source, file), function(err, data) {
													res.locals[key][subkey] = data.values;
													callback();
												});
											},
											function(err) {
												if (!err) {
													callback();
												} else {
													console.log("Erreur sur lecture des fichiers news");
													throw err;
													callback();
												};
											}
										);
									} else {
										//res.render('error');
										console.log("Erreur sur lecture du repertoire des fichiers news");
										throw err;
										callback();
									};
								});
							} else if (content.storage == "database") {
								callback();
							} else {
								callback();
							};
						} else {
							callback();
						};
					},
					function(err) {
						if (!err) {
							res.render(path.join(server.get('views'), page.jade));
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
			//handlers.log("root.route(" + sitemap.arbo[i].fullroute + ").all at time : ")
		)
		// route
		.get(
			handlers.render(sitemap.arbo[i])
		);
	};

	root.route('/').post(function (req, res, next) { // --> Il faudrait lire dans un fichier de conf toutes les routes en requete post comme on fait pour les requetes get
		console.log("Dans le post");
		console.log(req.body);

		fs.appendFile(path.join(server.get('dirname'), 'log', 'contact.log'), util.inspect(req.body, {showHidden: true, depth: null}) + '\n', function(err) {if (err) {console.log(err);};})

		res.status(204).end();		// HTTP status 204: No Content


		//res.writeHead(200).end();		--> Provoque une erreur : pourquoi ???

		/* Version envoi de mail. Ne fonctionne pas : problème de timeout à résoudre. Pareil avec curl.

		var email = require("emailjs/email");
		var server = email.server.connect(
			{
				user: "michel.goulas@maltebrun.com",
				password: "dp803375",
				host: "smtp.maltebrun.com", 
				ssl: false
			}
		);

		// send the message and get a callback with an error or details of the message that was sent
		server.send(
			{
				text: "i hope this works", 
				from: "MalteBrun <michel.goulas@maltebrun.com>", 
				to: "Michel GOULAS <michel@goulas.fr>, MalteBrun <michel.goulas@maltebrun.fr>",
				cc: "Michel GOULAS <michel@goulas.fr>",
				subject: "testing emailjs"
			},
			function(err, message) {
				console.log(err || message);
			}
		);

		*/





		//res.json(req.body);
		//next();
	});

	server.use('/', root);


	//============================================================================================================


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
