module.exports = (sequelize, DataTypes) => {
  const order = sequelize.define("order", {
    orderId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.STRING,
      validator: {
        notEmpty: false,
      },
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
  });
  order.associate = (models) => {
    order.hasMany(models.orderItem);
    order.belongsTo(models.restaurant);
    order.belongsTo(models.student, { foreignKey: "studentId" });
  };

  return order;
};
