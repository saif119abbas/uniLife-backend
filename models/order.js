const { restaurant } = require("./restaurant");
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
  });
  order.associate = (models) => {
    order.hasMany(models.orderItem);
    order.belongsTo(models.restaurant);
  };

  /*  order.associate = (models) => {
  };
  restaurant.associate = (models) => {
  };
  order.belongsTo(restaurant);
  restaurant.hasMany(order);*/
  return order;
};
