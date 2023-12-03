/*"use strict";

/*module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("restaurants", "cardID");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("restaurants", "cardID", {
      type: Sequelize.INTEGER,
      allowNull: false,
      validator: {
        notEmpty: false,
      }, // Change to false if the column should not allow null values
    });
  },
};*/
