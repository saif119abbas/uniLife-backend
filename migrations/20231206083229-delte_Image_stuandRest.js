"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    /* await queryInterface.removeColumn("students", "image");
    await queryInterface.removeColumn("restaurants", "image");*/
  },

  down: async (queryInterface, Sequelize) => {
    /*  await queryInterface.addColumn("students", "image", {
      type: Sequelize.BLOB,
    });
    await queryInterface.addColumn("restaurants", "image", {
      type: Sequelize.BLOB,
    });*/
  },
};
