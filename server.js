const app = require("./app");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const db = require("./models");
db.sequelize.sync().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});
