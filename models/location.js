module.exports = (sequelize, DataTypes) => {
  const location = sequelize.define("location", {
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
    lon: {
      type: DataTypes.FLOAT,
      validator: {
        notEmpty: false,
      },
    },
    lat: {
      type: DataTypes.FLOAT,
      validator: {
        notEmpty: false,
      },
    },
  });
  location.associate = (models) => {
    location.belongsTo(models.faculty);
  };
  return location;
};
