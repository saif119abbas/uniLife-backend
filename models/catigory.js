module.exports = (sequelize, DataTypes) => {
  const catigory = sequelize.define("catigory", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      validator: {
        notEmpty: false,
      },
    },
  });
  catigory.associate = (models) => {
    catigory.hasMany(models.post);
  };

  return catigory;
};
