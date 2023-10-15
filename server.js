const app = require("./app");
const { connection } = require("./utils/database");
//console.log(process.env);
connection();
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
