var param = require('./param.json');
var stringifyObject = require('stringify-object');

console.log("reading application params");

var env = param.hosts[param.host].environment;

//console.log(stringifyObject(env, {indent: '\t', singleQuotes: true}));

exports.env = env;
