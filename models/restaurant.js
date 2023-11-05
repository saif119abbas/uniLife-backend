module.exports = (sequelize, DataTypes) => {
  const restaurant = sequelize.define("restaurant", {
    restaurantId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validator: {
        notEmpty: false,
      },
    },
    email: {
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
    phoneNum: {
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
    permission: {
      type: DataTypes.STRING,
      defaultValue: process.env.RESTAURANT,
    },
  });
  restaurant.associate = (models) => {
    restaurant.hasOne(models.menu);
    restaurant.hasMany(models.order);
  };

  return restaurant;
};
