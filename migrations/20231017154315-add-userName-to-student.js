"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("student", "userName", {
      type: Sequelize.STRING,
      allowNull: true,
      validator: {
        notEmpty: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("student", "userName");
  },
};
