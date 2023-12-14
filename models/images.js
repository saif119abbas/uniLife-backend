module.exports = (sequelize, DataTypes) => {
  const images = sequelize.define("images", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  images.associate = (models) => {
    images.belongsTo(models.dormitoryPost);
  };

  return images;
};
