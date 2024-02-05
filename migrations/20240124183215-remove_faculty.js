"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    // await queryInterface.removeColumn("majors", "faculty");
  },
  down: async (queryInterface, Sequelize) => {
    // await queryInterface.addColumn("majors", "faculty", {
    //   type: Sequelize.BOOLEAN,
    //   defaultValue: false,
    // });
  },
};
