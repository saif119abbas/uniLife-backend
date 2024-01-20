module.exports = (sequelize, DataTypes) => {
  const savedDormitory = sequelize.define("savedDormitory", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    indexes: [
      {
        unique: true,
        fields: ["studentId", "dormitoryPostId"],
      },
    ],
  });
  savedDormitory.associate = (models) => {
    savedDormitory.belongsTo(models.student);
    savedDormitory.belongsTo(models.dormitoryPost);
  };
  return savedDormitory;
};
