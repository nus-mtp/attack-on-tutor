'use strict';

var avatars = require('./avatars.json');
var tutorials = require('./tutorials.json');

module.exports = {

    up: function(queryInterface, Sequelize) {

        queryInterface.bulkInsert('Avatars', avatars.array); // Insert avatars
        queryInterface.bulkInsert('Tutorials', tutorials.array); // Insert tutorials

        return;

    },

    down: function(queryInterface, Sequelize) {

        return;
        
    }
}