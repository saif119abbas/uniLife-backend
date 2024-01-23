"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /* await queryInterface.addColumn("orders", "paymentType", {
      type: Sequelize.STRING,
      allowNull: false,
    });*/
  },
  down: async (queryInterface, _) => {
    //await queryInterface.removeColumn("orders", "paymentType");
  },
};
