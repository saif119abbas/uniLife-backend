const { restaurant } = require("./restaurant");

module.exports = (sequelize, DataTypes) => {
  const menu = sequelize.define("menu", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
  });
  menu.associate = (models) => {
    menu.belongsTo(models.restaurant); // A Profile belongs to a User
    menu.hasMany(models.foodItem); // A User has many Posts
  };
  /* menu.associate = (models) => {
  };
 /* menu.belongsTo(restaurant);
  restaurant.hasOne(menu);*/
  return menu;
};
