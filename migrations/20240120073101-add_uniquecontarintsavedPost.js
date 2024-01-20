"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add unique constraint on studentId and dormitoryPostId
    return queryInterface.addConstraint("saveddormitories", {
      fields: ["studentId", "dormitoryPostId"],
      type: "unique",
      name: "unique_student_dormitory_constraint",
    });
  },

  down: async (queryInterface, _) => {
    // Remove the unique constraint
    return queryInterface.removeConstraint(
      "saveddormitories",
      "unique_student_dormitory_constraint"
    );
  },
};
