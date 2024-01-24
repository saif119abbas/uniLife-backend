"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /* await queryInterface.addColumn("notifications", "seen", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });*/
  },
  down: async (queryInterface, _) => {
    // await queryInterface.removeColumn("notifications", "seen");
  },
};
