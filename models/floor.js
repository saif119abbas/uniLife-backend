module.exports = (sequelize, DataTypes) => {
  const floor = sequelize.define("floor", {
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
    name: {
      type: DataTypes.STRING,
      validator: {
        notEmpty: false,
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validator: {
        notEmpty: false,
      },
    },
  });
  floor.associate = (models) => {
    floor.belongsTo(models.faculty);
    floor.hasMany(models.classroom);
  };

  return floor;
};
