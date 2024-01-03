module.exports = (sequelize, DataTypes) => {
  const lecture = sequelize.define(
    "lecture",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        validator: {
          notEmpty: false,
        },
      },
      classNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validator: {
          notEmpty: false,
          isNumeric: {
            msg: "The classNumber must be a number",
          },
        },
      },
      Name: {
        type: DataTypes.STRING,
        allowNull: false,
        validator: {
          notEmpty: false,
        },
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: false,
        validator: {
          notEmpty: false,
        },
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: false,
        validator: {
          notEmpty: false,
        },
      },
      day: {
        type: DataTypes.STRING,
        allowNull: false,
        validator: {
          notEmpty: false,
        },
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["day", "startTime", "endTime", "scheduleScheduleId"],
        },
      ],
    }
  );

  lecture.associate = (models) => {
    lecture.belongsTo(models.schedule);
  };
  return lecture;
};
