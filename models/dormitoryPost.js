module.exports = (sequelize, DataTypes) => {
  const dormitoryPost = sequelize.define("dormitoryPost", {
    dormitoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
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
  });
  dormitoryPost.associate = (models) => {
    dormitoryPost.hasMany(models.room);
    dormitoryPost.belongsTo(models.dormitoryOwner);
  };
  return dormitoryPost;
};
