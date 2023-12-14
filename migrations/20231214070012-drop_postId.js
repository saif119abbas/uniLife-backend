"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.removeColumn("images", "postId");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("images", "postId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "dormitoryposts", // Assuming your Student model is named "Student"
        key: "id",
      }, // Change to false if the column should not allow null values
    });
  },
};
