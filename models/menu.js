module.exports = (sequelize, DataTypes) => {
  const menu = sequelize.define("menu", {
    menuId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
  });
  menu.associate = (models) => {
    menu.belongsTo(models.restaurant);
    menu.hasMany(models.foodItem);
  };

  return menu;
};
