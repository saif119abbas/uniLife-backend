"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("posts", "reservedBy", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "students",
        as: "reservedBy",
        key: "id",
      },
    });
  },
  down: async (queryInterface, _) => {
    await queryInterface.removeColumn("posts", "reservedBy");
  },
};
