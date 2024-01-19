module.exports = (sequelize, DataTypes) => {
  const restaurant = sequelize.define("restaurant", {
    image: {
      type: DataTypes.STRING,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    restaurantDesc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  restaurant.associate = (models) => {
    restaurant.hasOne(models.menu);
    restaurant.belongsTo(models.user);
    restaurant.hasMany(models.order);
  };

  return restaurant;
};
