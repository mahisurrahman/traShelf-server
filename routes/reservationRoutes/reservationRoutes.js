const express = require ("express");
const router = express.Router();

const reservationController = require("../../controllers/reservationControllers/reservationControllers.js");

router.post("/crt", reservationController.createReservationControllers);


module.exports = router;