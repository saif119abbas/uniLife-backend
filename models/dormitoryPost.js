module.exports = (sequelize, DataTypes) => {
  const dormitoryPost = sequelize.define("dormitoryPost", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    numberOfRoom: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validator: {
        notEmpty: false,
      },
    },
    services: { type: DataTypes.STRING, allowNull: false },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lon: {
      type: DataTypes.FLOAT,
      validator: {
        notEmpty: false,
      },
    },
    lat: {
      type: DataTypes.FLOAT,
      validator: {
        notEmpty: false,
      },
    },
    distance: {
      type: DataTypes.FLOAT,
      validator: {
        notEmpty: false,
      },
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["male", "female"]],
      },
    },
  });

  dormitoryPost.associate = (models) => {
    dormitoryPost.belongsTo(models.dormitoryOwner);
    dormitoryPost.hasMany(models.room);
  };
  return dormitoryPost;
};
