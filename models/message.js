module.exports = (sequelize, DataTypes) => {
  const message = sequelize.define("message", {
    text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Add studentId and receiver as foreign keys
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "students", // Assuming your Student model is named "Student"
        key: "id",
      },
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "students", // Assuming your Student model is named "Student"
        key: "id",
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    seen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  message.associate = (models) => {
    message.belongsTo(models.student, {
      foreignKey: "senderId",
      as: "sender",
    });
    // You can use "as" to distinguish between sender and receiver relationships
    message.belongsTo(models.student, {
      foreignKey: "receiverId",
      as: "receiver",
    });
  };

  return message;
};
