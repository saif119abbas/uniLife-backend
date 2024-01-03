module.exports = (sequelize, DataTypes) => {
  const floor = sequelize.define("floor", {
    name: {
      type: DataTypes.STRING,
      unique: true,
      validator: {
        notEmpty: false,
      },
    },
  });
  floor.associate = (models) => {
    floor.belongsToMany(models.faculty, {
      through: models.facultyFloor,
    });
    floor.belongsToMany(models.classroom, {
      through: models.floorClass,
    });
  };
  return floor;
};
