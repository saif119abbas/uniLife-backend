module.exports = (sequelize, DataTypes) => {
  const restaurant = sequelize.define("restaurant", {
    cardID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      validator: {
        notEmpty: false,
      },
    },
  });
  restaurant.associate = (models) => {
    restaurant.hasOne(models.menu);
    restaurant.belongsTo(models.user);
    restaurant.hasMany(models.order);
  };

  return restaurant;
};
