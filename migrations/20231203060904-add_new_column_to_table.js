/*"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
     await queryInterface.addColumn("students", "major", {
      type: Sequelize.STRING,
      allowNull: false,
      validator: {
        notEmptyString: false,
      },
    });
    await queryInterface.addColumn("students", "blocked", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validator: {
        notEmptyString: false,
      },
    });
    await queryInterface.addColumn("orders", "notes", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, _) => {
    await queryInterface.removeColumn("students", "major");
    await queryInterface.removeColumn("students", "blocked");
    await queryInterface.removeColumn("orders", "notes");
  },
};*/
