"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /* await queryInterface.addColumn("restaurants", "isOpen", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });*/
  },
  down: async (queryInterface, _) => {
    // await queryInterface.removeColumn("restaurants", "isOpen");
  },
};
