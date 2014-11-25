module.exports = function (vars) {

	var
		stringifyObject = require('stringify-object'),
		merge = require('merge'),
		param = merge.recursive(false, vars, require('./param.js')(vars)),
		express = require('express'),
		config = require('../config'),
		server;

	// Create the HTTP server
	console.log('creating Express server...');
	server = express();

	// Apply the configuration
	config.apply(server, param);

	// Some initialization or whatever can go here...

	// Export the server
	return server;

};