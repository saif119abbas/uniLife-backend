module.exports = (sequelize, DataTypes) => {
  const dormitoryPost = sequelize.define(
    "dormitoryPost",
    {
      descrption: {
        type: DataTypes.STRING,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
        validator: {
          notEmpty: false,
        },
      },
    },
    { alter: true }
  );

  dormitoryPost.associate = (models) => {
    dormitoryPost.hasMany(models.room);
    dormitoryPost.hasMany(models.images);
    dormitoryPost.belongsTo(models.dormitoryOwner);
  };
  return dormitoryPost;
};
