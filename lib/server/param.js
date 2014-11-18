module.exports = function (vars) {

	var
		stringifyObject = require('stringify-object'),
		param = require('./param.json')[vars.env];

	console.log("reading server params");
	//console.log(stringifyObject(param, {indent: '\t', singleQuotes: true}));

	return param;
	//return require('./param.json').environments[vars.env].port;

};