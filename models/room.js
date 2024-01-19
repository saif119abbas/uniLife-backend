module.exports = (sequelize, DataTypes) => {
  const room = sequelize.define("room", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rent: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    numberOfPerson: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    avilableSeat: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  room.associate = (models) => {
    room.belongsTo(models.dormitoryPost);
    room.hasMany(models.student);
  };
  return room;
};
