"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add a new column
    /*  await queryInterface.addColumn("dormitoryowners", "id", {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      validator: {
        notEmpty: false,
      }
    });

    // Change the primary key
    await queryInterface.changePrimaryKey("dormitoryowners", "id");*/
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes in case of rollback
    /*  await queryInterface.removeColumn("dormitoryowners", "id");
    await queryInterface.changePrimaryKey("dormitoryowners", "SSN");*/
  },
};
