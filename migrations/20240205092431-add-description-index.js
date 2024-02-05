"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex("posts", ["description"]);
  },

  down: async (queryInterface, Sequelize) => {
    // If you want to remove the index in the rollback
    await queryInterface.removeIndex("posts", ["description"]);
  },
};
