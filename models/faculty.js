module.exports = (sequelize, DataTypes) => {
  const faculty = sequelize.define("faculty", {
    name: {
      type: DataTypes.STRING,
      unique: true,
      validator: {
        notEmpty: false,
      },
    },
    facultyNumber: {
      type: DataTypes.INTEGER,
      unique: true,
      validator: {
        notEmpty: false,
      },
    },
  });
  faculty.associate = (models) => {
    faculty.belongsToMany(models.floor, {
      through: models.facultyFloor,
    });
  };
  return faculty;
};
