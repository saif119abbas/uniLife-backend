"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /* await queryInterface.addColumn("fooditems", "until", {
      type: Sequelize.DATE,
      allowNull: true,
    });*/
  },
  down: async (queryInterface, _) => {
    // await queryInterface.removeColumn("fooditems", "until");
  },
};
