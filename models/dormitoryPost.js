module.exports = (sequelize, DataTypes) => {
  const dormitoryPost = sequelize.define("dormitoryPost", {
    description: {
      type: DataTypes.STRING,
    },
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: true,
      },
    },
  });

  dormitoryPost.associate = (models) => {
    dormitoryPost.belongsTo(models.dormitoryOwner);
    dormitoryPost.hasMany(models.room);
    dormitoryPost.hasMany(models.images);
  };
  return dormitoryPost;
};
