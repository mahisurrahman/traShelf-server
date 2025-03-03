const { app } = require("./app.js");
const authRoutes = require("./routes/authRoutes/authRoutes.js");
const userRoutes = require("./routes/userRoutes/userRoutes.js");

const routermanager = () => {
  //Auth Routes//
  app.use("/auth", authRoutes);

  //User Routes//
  app.use("/users", userRoutes);
};

module.exports = routermanager;
