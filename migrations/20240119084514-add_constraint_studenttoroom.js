"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the foreign key constraint
    /*  return queryInterface.addConstraint("students", {
      fields: ["roomId"],
      type: "foreign key",
      name: "students_ibfk_1",
      references: {
        table: "rooms",
        field: "id",
      },
      onDelete: "cascade", // Specify the desired onDelete behavior
      onUpdate: "cascade", // Specify the desired onUpdate behavior
    });*/
  },

  down: async (queryInterface, _) => {
    //  return queryInterface.removeConstraint("students", "students_ibfk_2");
  },
};
