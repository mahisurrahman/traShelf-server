const port = process.env.PORT || 3999;
const connectToDb = require("./database/db.js");
const { app } = require("./app");
const routermanager = require("./routermanager.js");
// const routermanager = require("./routermanager.js");

connectToDb()
  .then(() => {
    routermanager();

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
