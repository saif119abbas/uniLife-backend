module.exports = (sequelize, _) => {
  const admin = sequelize.define("admin", {});
  admin.associate = (models) => {
    admin.belongsTo(models.user);
  };
  return admin;
};
