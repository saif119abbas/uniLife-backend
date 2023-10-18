module.exports = (sequelize, DataTypes) => {
  const lecture = sequelize.define("lecture", {
    lectureId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    classNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validator: {
        notEmpty: false,
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
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    endTime: {
      type: DataTypes.STRING,
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
  });
  lecture.associate = (models) => {
    lecture.belongsTo(models.schedule); // A Profile belongs to a User
  };
  return lecture;
};
