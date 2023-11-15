// migrations/xxxxxx-add-new-column.js

"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("orders", "totalPrice", {
      type: Sequelize.FLOAT,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("orders", "totalPrice");
  },
};
