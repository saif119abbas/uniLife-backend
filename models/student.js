module.exports = (sequelize, DataTypes) => {
  const student = sequelize.define("student", {
    major: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmptyString: false,
      },
    },
    blocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validator: {
        notEmptyString: false,
      },
    },
    image: {
      type: DataTypes.STRING,
    },
  });
  student.associate = (models) => {
    student.hasOne(models.schedule);
    student.belongsTo(models.user);
    student.hasMany(models.order, { foreignKey: "studentId" });
    student.hasMany(models.post, { foreignKey: "studentId" });
    student.hasMany(models.message, { foreignKey: "studentId" });
    student.hasMany(models.FCM);
    student.hasMany(models.report);
    student.hasMany(models.emergency);
    student.belongsTo(models.room);
    student.hasMany(models.savedDormitory);
  };
  return student;
};
