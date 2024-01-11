"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*  await queryInterface.addColumn("messages", "seen", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });*/
  },

  down: async (queryInterface, _) => {
    // await queryInterface.removeColumn("messages", "seen");
  },
};
