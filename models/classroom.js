module.exports = (sequelize, DataTypes) => {
  const classroom = sequelize.define("classroom", {
    number: {
      type: DataTypes.INTEGER,
      unique: true,
      validator: {
        notEmpty: false,
      },
    },
  });

  classroom.associate = (models) => {
    classroom.belongsToMany(models.floor, {
      through: models.floorClass,
    });
  };
  return classroom;
};
