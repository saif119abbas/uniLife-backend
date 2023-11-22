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
  /*dormitoryPost
    .sync({ alter: true })
    .then(() => {
      console.log("Table synced successfully.");
    })
    .catch((error) => {
      console.error("Error syncing table: ", error);
    });*/
  dormitoryPost.associate = (models) => {
    dormitoryPost.hasMany(models.room);
    dormitoryPost.belongsTo(models.dormitoryOwner);
  };
  return dormitoryPost;
};
