module.exports = (sequelize, DataTypes) => {
  const dormitoryView = sequelize.define(
    "dormitoryView",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["dormitoryPostId", "studentId"],
        },
      ],
    }
  );
  dormitoryView.associate = (models) => {
    dormitoryView.belongsTo(models.dormitoryPost);
    dormitoryView.belongsTo(models.student);
  };

  return dormitoryView;
};
