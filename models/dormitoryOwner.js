module.exports = (sequelize, DataTypes) => {
  const dormitoryOwner = sequelize.define("dormitoryOwner", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    SSN: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  dormitoryOwner.associate = (models) => {
    dormitoryOwner.belongsTo(models.user);
    dormitoryOwner.hasMany(models.dormitoryPost);
  };
  return dormitoryOwner;
};
