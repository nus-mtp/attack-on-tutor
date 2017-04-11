var Sequelize = require('sequelize');

module.exports = {
	up: function (queryInterface, Sequelize) {
		return queryInterface.addColumn('users', 'levelsSpent', {
			type: Sequelize.INTEGER,
			defaultValue: 0
		};
	}
}