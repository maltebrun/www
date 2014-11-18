var
	merge = require('merge'),
	param = merge.recursive(false, require('./param.js'), {'dirname': __dirname}),

	server = require('./lib/server')(param),
	db = require('./lib/db')(param),
	handler = require('./lib/handler')(db);

// Setup routes
require('./lib/router')(server, handler);

// All set, start listening!
server.listen(server.get('port'));
console.log("Express server listening on port %d in %s mode", server.get('port'), server.get('env'));
