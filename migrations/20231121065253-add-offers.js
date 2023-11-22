// In the migration file (e.g., xxxxxxxxxx-add-columns-to-your-model.js)
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to the table
    /*await queryInterface.addColumn("fooditems", "isOffer", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    });*/
    await queryInterface.addColumn("fooditems", "offerPrice", {
      type: Sequelize.FLOAT,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    });
    await queryInterface.addColumn("fooditems", "offerDesc", {
      type: Sequelize.STRING,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the columns added in the 'up' function
    await queryInterface.removeColumn("fooditems", "isOffer");
    await queryInterface.removeColumn("fooditems", "offerPrice");
    await queryInterface.removeColumn("fooditems", "offerDesc");
  },
};
