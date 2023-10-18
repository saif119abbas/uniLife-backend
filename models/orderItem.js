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
    orderItem.belongsToMany(models.foodItem, { through: "OrderItem_foodItem" });
  };
  /* orderItem.associate = (models) => {
  };
 /*orderItem.belongsTo(order);
  order.hasMany(orderItem);
*/
  return orderItem;
};
