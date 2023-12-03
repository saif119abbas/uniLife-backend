module.exports = (sequelize, DataTypes) => {
  const restaurant = sequelize.define("restaurant", {
    image: {
      type: DataTypes.BLOB,
    },
  });
  restaurant.associate = (models) => {
    restaurant.hasOne(models.menu);
    restaurant.belongsTo(models.user);
    restaurant.hasMany(models.order);
  };

  return restaurant;
};
