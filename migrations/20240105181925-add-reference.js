"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*await queryInterface.addColumn("floors", "reference", {
      type: Sequelize.INTEGER,
      allowNull: true,
      validator: {
        notEmpty: false,
      },
    });*/
  },

  down: async (queryInterface, _) => {
    // await queryInterface.removeColumn("floors", "reference");
  },
};
