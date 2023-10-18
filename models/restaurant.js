module.exports = (sequelize, DataTypes) => {
  const restaurant = sequelize.define("restaurant", {
    restaurantId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validator: {
        notEmpty: false,
      },
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validator: {
        notEmpty: false,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
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
    restaurant.hasMany(models.order);
  };
  /*restaurant.associate = (models) => {
  };*/

  return restaurant;
};
