module.exports = (sequelize, DataTypes) => {
  const admin = sequelize.define("admin", {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    phoneNum: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    permission: {
      type: DataTypes.STRING,
      defaultValue: process.env.ADMIN,
    },
  });
  return admin;
};
