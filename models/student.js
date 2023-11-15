module.exports = (sequelize, _) => {
  const student = sequelize.define("student", {});
  student.associate = (models) => {
    student.hasOne(models.schedule);
    student.belongsTo(models.user);
    student.hasMany(models.order, { foreignKey: "studentId" });
  };
  return student;
};
