module.exports = (sequelize, DataTypes) => {
  const schedule = sequelize.define("schedule", {
    scheduleId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.STRING,
      validator: {
        notEmpty: false,
      },
    },
  });
  schedule.associate = (models) => {
    schedule.hasMany(models.lecture);
    schedule.belongsTo(models.student);
  };

  return schedule;
};
