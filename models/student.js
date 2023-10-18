module.exports = (sequelize, DataTypes) => {
  const student = sequelize.define("student", {
    unevirsityId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: [true, "ER_DUP_ENTRY"],
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: [true, "ER_DUP_ENTRY"],
      validator: {
        notEmpty: false,
      },
      unique: true,
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
      unique: [true, "ER_DUP_ENTRY"],
    },
  });
  student.associate = (models) => {
    student.hasOne(models.schedule);
  };
  return student;
};
