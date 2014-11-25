var
	merge = require('merge'),
	env = process.env.MALTEBRUN_ENV ? process.env.MALTEBRUN_ENV : 'DEV',
	param = merge.recursive(false, {'env': env}, {'dirname': __dirname}),

	server = require('./lib/server')(param),
	db = require('./lib/db')(param),
	handler = require('./lib/handler')(db);

// Setup routes
require('./lib/router')(server, handler);

// All set, start listening!
server.listen(server.get('port'), server.get('host'));
console.log("Express server listening on host %s on port %d in %s mode, base directory is : %s", server.get('host'), server.get('port'), server.get('env'), server.get('dirname'));
