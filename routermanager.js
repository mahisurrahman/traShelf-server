const { app } = require("./app.js");
const authRoutes = require("./routes/authRoutes/authRoutes.js");
const userRoutes = require("./routes/userRoutes/userRoutes.js");
const bookRoutes = require("./routes/bookRoutes/bookRoutes.js");
const categoryRoutes = require("./routes/categoryRoutes/categoryRoutes.js");
const reservationRoutes = require("./routes/reservationRoutes/reservationRoutes.js");
const extendedReservationRoutes = require("./routes/extendedReservationsRoutes/extendedReservationsRoutes.js");

const routermanager = () => {
  //Auth Routes//
  app.use("/auth", authRoutes);

  //User Routes//
  app.use("/users", userRoutes);

  //Books Routes//
  app.use("/books", bookRoutes);

  //Category Routes//
  app.use("/categories", categoryRoutes);

  //Reservation Routes//
  app.use("/reservations", reservationRoutes);

  //Extended Reservations//
  app.use("/extended", extendedReservationRoutes);
};

module.exports = routermanager;
