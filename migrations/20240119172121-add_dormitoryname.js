"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*await queryInterface.addColumn("dormitoryposts", "name", {
      type: Sequelize.STRING,
      allowNull: false,
    });*/
  },
  down: async (queryInterface, _) => {
   // await queryInterface.removeColumn("dormitoryposts", "name");
  },
};
