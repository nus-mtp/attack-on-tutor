'use strict';

module.exports = {

    up: function(queryInterface, Sequelize) {

        var promises = [];

        promises.push(queryInterface.createTable('Users', {
          id: {
            type: Sequelize.STRING,
            unique: true,
            primaryKey: true,
        },
        name: { type: Sequelize.STRING },
        email: { type: Sequelize.STRING },
        gender: { type: Sequelize.ENUM('Male', 'Female') },
        token: { type: Sequelize.STRING(511) },
        avatarId: { type: Sequelize.STRING },
        createdAt: {
            type: Sequelize.DATE
        },
        updatedAt: {
            type: Sequelize.DATE
        },
        levelsSpent: { type: Sequelize.INTEGER }
        }));


        promises.push(queryInterface.createTable('Tutorials', {
            id: {
              type: Sequelize.UUID,
              defaultValue: Sequelize.UUIDV4,
              unique: true,
              primaryKey: true
          },
          grouptype: {
              type: Sequelize.STRING,
          },
          name: {
              type: Sequelize.STRING,
          },
          courseid: {
              type: Sequelize.STRING,
          },
          coursecode: {
              type: Sequelize.STRING
          },
          coursename: {
              type: Sequelize.STRING
          },
          week: {
              type: Sequelize.STRING
          },
          day: {
              type: Sequelize.STRING
          },
          time: {
              type: Sequelize.STRING
          },
          createdAt: {
              type: Sequelize.DATE
          },
          updatedAt: {
              type: Sequelize.DATE
          }
        }));


        promises.push(queryInterface.createTable('Avatars', {
            id: {
                type: Sequelize.STRING,
                unique: true,
                primaryKey: true
            },
            name: { type: Sequelize.STRING },
            price: { type: Sequelize.INTEGER },
            url: { type: Sequelize.STRING },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            }
        }));
        
        Promise.all(promises);

    },

    down: function(queryInterface, Sequelize) {
        queryInterface.dropTable('Avatars');
        queryInterface.dropTable('Tutorials');
        queryInterface.dropTable('Users');
        return;
    }
}