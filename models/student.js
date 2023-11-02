const Joi = require("@hapi/joi");
//universityId
module.exports = (sequelize, DataTypes) => {
  const student = sequelize.define("student", {
    unevirsityId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: [true, "ER_DUP_ENTRY"],
      allowNull: false,
      validator: {
        notEmpty: {
          msg: "provide your univirsity id",
        },
        isNumeric: {
          msg: "The Id must be a number",
        },
      },
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: {
          msg: "provide a username",
        },
      },
    },
    Email: {
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
      validator: {
        notEmpty: {
          msg: "provide your password",
        },
        len: {
          args: [8, Infinity],
          msg: "Password must be at least 8 characters long.",
        },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: {
          msg: "provide your phone number",
        },
      },
      unique: [true, "ER_DUP_ENTRY"],
    },
    token: {
      type: DataTypes.STRING,
      unique: true,
    },
  });
  student.associate = (models) => {
    student.hasOne(models.schedule);
  };
  return student;
};
