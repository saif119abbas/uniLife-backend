"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*await queryInterface.addColumn("students", "roomId", {
      type: Sequelize.STRING,
    });*/
  },
  down: async (queryInterface, _) => {
   // await queryInterface.removeColumn("students", "roomId");
  },
};
