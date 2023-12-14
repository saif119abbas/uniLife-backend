"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("floors", "image", {
      type: Sequelize.STRING,
      unique: true,
      validator: {
        notEmpty: false,
      },
    });
  },

  down: async (queryInterface, _) => {
    await queryInterface.removeColumn("floors", "image");
  },
};
