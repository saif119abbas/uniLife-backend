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
    Email: {
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
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
  });
  dormitoryOwner.associate = (models) => {
    dormitoryOwner.hasMany(models.dormitoryPost); // A User has one Profile
  };
  return dormitoryOwner;
};
