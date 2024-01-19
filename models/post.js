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
      references: {
        model: "students",
        as: "reservedBy",
        key: "id",
      },
    },
    image: {
      type: DataTypes.STRING,
    },
  });
  post.associate = (models) => {
    post.belongsToMany(models.major, {
      through: models.postMajor,
    });
    post.belongsTo(models.catigory);
    post.belongsTo(models.student, { foreignKey: "studentId" });
    post.hasMany(models.report);
  };

  return post;
};
