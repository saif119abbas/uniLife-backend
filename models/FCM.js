module.exports = (sequelize, DataTypes) => {
  const FCM = sequelize.define("FCM", {
    token: {
      type: DataTypes.STRING,
      unique: true,
      validator: {
        notEmpty: false,
      },
    },
  });
  FCM.associate = (models) => {
    FCM.belongsTo(models.student);
  };

  return FCM;
};
