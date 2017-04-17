'use strict';


module.exports = {
    up: function(queryInterface, Sequelize) {

        var promises = [];

        promises.push(queryInterface.createTable('userTutorials', {
            role: {
                type: Sequelize.ENUM,
                values: ['student', 'tutor'],
                allowNull: false
            },
            tutorialId: {
                type: Sequelize.UUID,
                references: {
                    model: 'Tutorials',
                    key: 'id'
                },
                onDelete: 'cascade'
                },
            userId: {
                type: Sequelize.STRING,
                references: {
                    model: 'Users',
                    key: 'id'
                 },
                 onDelete: 'cascade'
            },
            exp: {
                type: Sequelize.INTEGER
            },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            }
        }));

        promises.push(queryInterface.createTable('userAvatars',{ 
            userId: {
                type: Sequelize.STRING,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onDelete: 'cascade'
            },
            avatarId: {  
                type: Sequelize.STRING,
                references: {
                    model: 'Avatars',
                    key: 'id'
                },
                onDelete: 'cascade'
            },
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
            
            queryInterface.dropTable('userTutorials');
            queryInterface.dropTable('userAvatars');
            return;
        }
    }