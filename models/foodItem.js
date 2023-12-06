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
    image: {
      type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    isOffer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    offerPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    offerDesc: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    image: {
      type: DataTypes.BLOB,
    },
  });
  foodItem.associate = (models) => {
    foodItem.belongsTo(models.menu); // A Profile belongs to a User
    foodItem.belongsToMany(models.orderItem, {
      through: models.OrderItem_FoodItem,
    }); // A User belongs to many Roles
  };
  /*foodItem.associate = (models) => {
  };*/

  return foodItem;
};
