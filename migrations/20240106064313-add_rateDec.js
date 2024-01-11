"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /* await queryInterface.addColumn("orders", "rateDesc", {
      type: Sequelize.STRING,
      allowNull: true,
    });*/
  },

  down: async (queryInterface, _) => {
    // await queryInterface.removeColumn("orders", "rateDesc");
  },
};
