module.exports = (sequelize, DataTypes) => {
  const facultyFloor = sequelize.define("facultyFloor", {
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return facultyFloor;
};
