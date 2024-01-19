"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
  /*  await queryInterface.addColumn("restaurants", "rating", {
      type: Sequelize.FLOAT,
    });
    await queryInterface.addColumn("restaurants", "restaurantDesc", {
      type: Sequelize.STRING,
    });*/
  },
  down: async (queryInterface, _) => {
  //  await queryInterface.removeColumn("restaurants", "rating");
   // await queryInterface.removeColumn("restaurants", "restaurantDesc");
  },
};
