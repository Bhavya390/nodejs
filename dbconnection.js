var mysql = require('mysql');
var connection = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'manjula8',
	database:'paypalEmployee',
	connectionLimit : 10
});

module.exports = connection;