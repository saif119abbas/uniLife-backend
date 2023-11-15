module.exports = (sequelize, DataTypes) => {
  const orderItem = sequelize.define("orderItem", {
    orderItemId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    Qauntity: {
      type: DataTypes.INTEGER,
      validator: {
        notEmpty: false,
      },
    },
    unitPrice: {
      type: DataTypes.INTEGER,
      validator: {
        notEmpty: false,
      },
    },
  });
  orderItem.associate = (models) => {
    orderItem.belongsTo(models.order);
    orderItem.belongsToMany(models.foodItem, {
      through: models.OrderItem_FoodItem,
    });
  };
  return orderItem;
};
