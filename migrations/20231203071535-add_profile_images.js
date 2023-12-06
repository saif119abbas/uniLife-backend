"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*  await queryInterface.addColumn("students", "image", {
         image: {
          type: Sequelize.BLOB,
        },
});
      await queryInterface.addColumn("restaurants", "image", {
         image: {
           type: Sequelize.BLOB,
         },
       });*/
  },

  down: async (queryInterface) => {
    // await queryInterface.removeColumn("students", "image");
    //await queryInterface.removeColumn("restaurants", "image");
  },
};
