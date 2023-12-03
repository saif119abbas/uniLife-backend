/*"use strict";

/*module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("lectures", "lectureId");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("lectures", "lectureId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      validator: {
        notEmpty: false,
      }, // Change to false if the column should not allow null values
    });
  },
};*/
