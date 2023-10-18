module.exports = (sequelize, DataTypes) => {
  const foodItem = sequelize.define("foodItem", {
    foodId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    nameOfFood: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
      unique: [true, "This food is already exists"],
    },
  });
  foodItem.associate = (models) => {
    foodItem.belongsTo(models.menu); // A Profile belongs to a User
    foodItem.belongsToMany(models.orderItem, { through: "OrderItem_foodItem" }); // A User belongs to many Roles
  };
  /*foodItem.associate = (models) => {
  };*/

  return foodItem;
};
