module.exports = (sequelize, DataTypes) => {
  const major = sequelize.define("major", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      validator: {
        notEmpty: false,
      },
    },
  });
  major.associate = (models) => {
    major.belongsToMany(models.post, {
      through: models.postMajor,
    });
  };

  return major;
};
