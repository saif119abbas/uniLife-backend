const app = require("./app");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const { connection } = require("./utils/database");
const db = require("./models");
connection();
db.sequelize.sync().then((req) => {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});
