"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /* await queryInterface.addColumn("students", "image", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("restaurants", "image", {
      type: Sequelize.STRING,
    });*/
  },

  down: async (queryInterface, _) => {
    /* await queryInterface.removeColumn("students", "image");
    await queryInterface.removeColumn("restaurants", "image");*/
  },
};
