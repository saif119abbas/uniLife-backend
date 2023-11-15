module.exports = (sequelize, DataTypes) => {
  const dormitoryOwner = sequelize.define("dormitoryOwner", {
    SSN: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
  });
  dormitoryOwner.associate = (models) => {
    dormitoryOwner.belongsTo(models.user);
    dormitoryOwner.hasMany(models.dormitoryPost);
  };
  return dormitoryOwner;
};
