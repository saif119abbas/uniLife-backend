module.exports = (sequelize, DataTypes) => {
  const FCM = sequelize.define("FCM", {
    token: {
      type: DataTypes.STRING,

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
