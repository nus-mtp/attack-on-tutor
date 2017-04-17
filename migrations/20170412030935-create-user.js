'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {

    var promises = [];
    var promises2 = [];

    return queryInterface.createTable('Users', {
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
    }).then( function (response) {
    queryInterface.createTable('Tutorials', {
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
    })}).then( function (response) {
    queryInterface.createTable('Avatars',{
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
    })}).then( function (response) {
    queryInterface.createTable('userTutorials', {
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
    })}).then( function (response) {
    queryInterface.createTable('userAvatars',{ 
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
    })});

  },

  down: function(queryInterface, Sequelize) {

    return queryInterface.dropTable('userTutorials')
    .then( function () { queryInterface.dropTable('userAvatars') })
    .then( function () { queryInterface.dropTable('Avatars') })
    .then( function () { queryInterface.dropTable('Tutorials') })
    .then( function () { queryInterface.dropTable('Users') });
    
  }
}