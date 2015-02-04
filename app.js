var
	path = require('path'),
	merge = require('merge'),
	env = process.env.MALTEBRUN_ENV ? process.env.MALTEBRUN_ENV : 'DEV',
	param = merge.recursive(false, {'env': env}, {'dirname': __dirname}),

	server = require('./lib/server')(param),
	db = require('./lib/db')(param),
	handler = require('./lib/handler')(db);

	fs = require('fs'),
	logger = require('morgan');

if (server.get('env') === 'PROD') {
	// create a write stream (in append mode)
	var accessLogStream = fs.createWriteStream(path.join(server.get('dirname'), 'log', 'morgan.log'), {flags: 'a'});
	server.use(logger('combined', {stream: accessLogStream}));
} else {
	server.use(logger('dev'));
};

// Setup routes
require('./lib/router')(server, handler);

// All set, start listening!
server.listen(server.get('port'), server.get('host'));
console.log("Express server listening on host %s on port %d in %s mode, base directory is : %s", server.get('host'), server.get('port'), server.get('env'), server.get('dirname'));
