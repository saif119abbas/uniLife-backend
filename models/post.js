module.exports = (sequelize, DataTypes) => {
  const post = sequelize.define("post", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      validator: {
        notEmpty: false,
      },
    },
    reservedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    image: {
      type: DataTypes.BLOB,
    },
  });
  post.associate = (models) => {
    post.belongsToMany(models.major, {
      through: models.postMajor,
    });
    post.hasOne(models.catigory);
    post.belongsTo(models.student, { foreignKey: "studentId" });
  };

  return post;
};