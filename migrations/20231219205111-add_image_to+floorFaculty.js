"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*await queryInterface.addColumn("facultyfloors", "image", {
      type: Sequelize.STRING,
      allowNull: true,
    });*/
  },

  down: async (queryInterface, _) => {
    //await queryInterface.removeColumn("facultyfloors", "image");
  },
};
