"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // await queryInterface.removeColumn("posts", "reservedBy");
  },
  down: async (queryInterface, Sequelize) => {
    /* await queryInterface.addColumn("posts", "reservedBy", {
      type: Sequelize.INTEGER,
      allowNull: true,
      validator: {
        notEmpty: false,
      },
    });*/
  },
};
