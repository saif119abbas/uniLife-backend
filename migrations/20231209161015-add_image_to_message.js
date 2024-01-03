"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add a new column
    /*await queryInterface.addColumn("messages", "image", {
      type: Sequelize.STRING,
      allowNull: true,
    });*/
  },

  down: async (queryInterface, _) => {
    // Revert changes in case of rollback
   // await queryInterface.removeColumn("messages", "image");
  },
};
