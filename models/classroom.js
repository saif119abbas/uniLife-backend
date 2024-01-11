module.exports = (sequelize, DataTypes) => {
  const classroom = sequelize.define("classroom", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
      validator: {
        notEmpty: false,
      },
    },
    number: {
      type: DataTypes.INTEGER,
      validator: {
        notEmpty: false,
      },
    },
  });

  classroom.associate = (models) => {
    classroom.belongsTo(models.floor);
  };
  return classroom;
};
