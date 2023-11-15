module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define("user", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
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
      unique: true,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    role: {
      type: DataTypes.STRING,
    },
  });
  user.associate = (models) => {
    user.hasOne(models.student);
    user.hasOne(models.restaurant);
    user.hasOne(models.dormitoryOwner);
    user.hasOne(models.admin);
  };
  return user;
};
