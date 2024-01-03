"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*  await queryInterface.addColumn("fooditems", "image", {
      type: Sequelize.STRING,
    });*/
  },

  down: async (queryInterface, _) => {
    // await queryInterface.removeColumn("fooditems", "image");
  },
};
