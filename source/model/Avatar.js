/**
 * @module model/Avatar
 * @type {Sequelize|*|exports|module.exports}
 */
var sequelize = require ('../sequelize');
var Sequelize = require ('sequelize');
var models = require('../../models');
var User = models.User;
var Tutorial = models.Tutorial;

/**
 * Define avatar model
 * @type {Model}
 */
// var Avatar = sequelize.define('avatar', {
// 	id: {
// 		type: Sequelize.UUID,
// 		defaultValue: Sequelize.UUIDV4,
// 		unique: true,
// 		primaryKey: true
// 	},
// 	name: { type: Sequelize.STRING },
// 	price: { type: Sequelize.INTEGER },
// 	url: { type: Sequelize.STRING }
// });

// Avatar.belongsToMany(User, {
// 	foreignKey: 'avatarId',
// 	through: 'userAvatar'
// });

// sequelize.sync();
