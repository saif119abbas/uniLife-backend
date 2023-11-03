const Joi = require("@hapi/joi");
//universityId
module.exports = (sequelize, DataTypes) => {
  const student = sequelize.define("student", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: [true, "ER_DUP_ENTRY"],
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: {
          msg: "provide a username",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: [true, "ER_DUP_ENTRY"],
      validator: {
        notEmpty: {
          msg: "provide your email",
        },
        isEmail: {
          msg: "Invalid email",
        },
      },
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNum: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: [true, "ER_DUP_ENTRY"],
    },
  });
  student.associate = (models) => {
    student.hasOne(models.schedule);
  };
  return student;
};
