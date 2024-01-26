"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("ads", "link", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  down: async (queryInterface, _) => {
    await queryInterface.removeColumn("ads", "link");
  },
};
