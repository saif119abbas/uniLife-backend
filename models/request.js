module.exports = (sequelize, DataTypes) => {
  const request = sequelize.define(
    "request",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
    },

    {
      indexes: [
        {
          unique: true,
          fields: ["postId", "studentId"],
        },
      ],
    }
  );
  request.associate = (models) => {
    request.belongsTo(models.post);
    request.belongsTo(models.student);
  };

  return request;
};
