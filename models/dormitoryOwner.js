module.exports = (sequelize, DataTypes) => {
  const dormitoryOwner = sequelize.define("dormitoryOwner", {
    SSN: {
      type: DataTypes.INTEGER,
      primaryKey: true,
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
      defaultValue: process.env.DORMITORY,
    },
  });
  dormitoryOwner.associate = (models) => {
    dormitoryOwner.hasMany(models.dormitoryPost); // A User has one Profile
  };
  return dormitoryOwner;
};
