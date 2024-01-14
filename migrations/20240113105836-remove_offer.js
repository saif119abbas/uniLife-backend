"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    /* await queryInterface.removeColumn("fooditems", "isOffer");
    await queryInterface.removeColumn("fooditems", "offerDesc");
    await queryInterface.removeColumn("fooditems", "offerPrice");*/
  },
  down: async (queryInterface, Sequelize) => {
    /* await queryInterface.addColumn("fooditems", "isOffer", {
      type: Sequelize.BOOLEAN,
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
    await queryInterface.addColumn("fooditems", "offerPrice", {
      type: Sequelize.FLOAT,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    });*/
  },
};
