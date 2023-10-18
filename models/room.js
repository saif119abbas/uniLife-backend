module.exports = (sequelize, DataTypes) => {
  const room = sequelize.define("room", {
    roomId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    typeOfRoom: {
      type: DataTypes.STRING,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    rent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    numberOfPerson: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
  });
  room.associate = (models) => {
    room.belongsTo(models.dormitoryPost); // A User has one Profile
  };
  return room;
};
