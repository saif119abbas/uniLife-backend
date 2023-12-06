"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    //  await queryInterface.removeColumn("fooditems", "image");
  },

  down: async (queryInterface, Sequelize) => {
    /* await queryInterface.addColumn("fooditems", "image", {
      type: Sequelize.BLOB,
    });*/
  },
};
