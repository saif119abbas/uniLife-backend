module.exports = (sequelize, DataTypes) => {
  const report = sequelize.define(
    "report",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      message: {
        type: DataTypes.STRING,
        validator: {
          notEmpty: false,
        },
      },
      reportedStudent: {
        type: DataTypes.INTEGER,
        validator: {
          notEmpty: true,
        },
        references: {
          model: "students",
          key: "id",
        },
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["postId", "studentId"],
        },
      ],
    }
  );
  report.associate = (models) => {
    report.belongsTo(models.post);
    report.belongsTo(models.student);
  };

  return report;
};
