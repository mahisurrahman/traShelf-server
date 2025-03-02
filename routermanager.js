const { app } = require("./app.js");
const authRoutes = require("./routes/authRoutes/authRoutes.js");

const routermanager = () => {
  //Auth Routes//
  app.use("/auth", authRoutes);
};

module.exports = routermanager;
