"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the foreign key constraint
    // await queryInterface.removeConstraint("messages", "messages_ibfk_3");

    // // You can add more operations if needed

    // return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    // If you want to revert the changes, you might need to add the constraint back
    // await queryInterface.addConstraint("messages", {
    //   fields: ["studentId"],
    //   type: "foreign key",
    //   name: "messages_ibfk_3",
    //   references: {
    //     table: "students",
    //     field: "id",
    //   },
    //   onDelete: "SET NULL",
    //   onUpdate: "CASCADE",
    // });

    // You can add more operations if needed

    // return Promise.resolve();
  },
};
