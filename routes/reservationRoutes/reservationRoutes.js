const express = require ("express");
const router = express.Router();

const reservationController = require("../../controllers/reservationControllers/reservationControllers.js");

router.post("/crt", reservationController.createReservationControllers);
router.get("/get/all", reservationController.getAllReservationsControllers);
router.get("/getById/:id", reservationController.getSignleReservationsControllers);
router.post("/upt/:id", reservationController.updateSingleReservationsControllers);
router.get("/del/:id", reservationController.removeSingleReservationsControllers);


module.exports = router;