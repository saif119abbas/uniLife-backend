"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /* return queryInterface.addConstraint("reports", {
      fields: ["postId", "studentId"],
      type: "unique",
      name: "unique_report_constraint",
    });*/
  },

  down: async (queryInterface, Sequelize) => {
    /*  return queryInterface.removeConstraint(
      "reports",
      "unique_report_constraint"
    );*/
  },
};
