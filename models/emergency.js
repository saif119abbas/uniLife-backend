module.exports = (sequelize, DataTypes) => {
  const emergency = sequelize.define("emergency", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  emergency.associate = (models) => {
    emergency.belongsTo(models.room);
    emergency.belongsTo(models.student);
  };
  return emergency;
};
