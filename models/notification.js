module.exports = (sequelize, DataTypes) => {
  const notification = sequelize.define("notification", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    text: {
      type: DataTypes.STRING,
      validator: {
        notEmpty: false,
      },
    },
    type: {
      type: DataTypes.STRING,
      validator: {
        notEmpty: false,
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    seen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });
  notification.associate = (models) => {
    notification.belongsTo(models.student);
  };

  return notification;
};
