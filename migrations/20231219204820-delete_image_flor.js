"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    //await queryInterface.removeColumn("floors", "image");
  },

  down: async (queryInterface, _) => {
    /*  await queryInterface.addColumn("floors", "image", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });*/
  },
};
