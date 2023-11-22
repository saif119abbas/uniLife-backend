// migrations/xxxxxx-add-new-column.js

"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("fooditems", "category", {
      type: Sequelize.STRING,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("fooditems", "category");
  },
};
