var express = require ('express');
var app = require ('../app');
var Sequelize = require ('sequelize');
var fs = require ('fs')

if (process.env.DATABASE_URL) {
	var sequelize = new Sequelize(process.env.DATABASE_URL);
} else {
	var sequelize = new Sequelize (app.get('db-name'), app.get('db-username'), app.get('db-password'), {
		host: app.get('db-host'),
		dialect: app.get('db-dialect'),
		pool: {
			max: 5,
			min: 0,
			idle: 10000
		}
		// TODO: implement logging 
	});
}


module.exports = sequelize;