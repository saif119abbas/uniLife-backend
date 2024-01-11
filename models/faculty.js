module.exports = (sequelize, DataTypes) => {
  const faculty = sequelize.define("faculty", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
      validator: {
        notEmpty: false,
      },
    },
    facultyName: {
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
    faculty.hasMany(models.floor);
    faculty.hasMany(models.location);
  };
  return faculty;
};
