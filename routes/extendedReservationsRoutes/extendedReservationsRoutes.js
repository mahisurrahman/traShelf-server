const express = require ('express');
const router = express.Router();
const extendedReservationController = require ("../../controllers/extendedReservationControllers/extendedReservationControllers.js");


router.get("/get/all", extendedReservationController.getAllExtendReservationControllers);
router.get("/getById/:id", extendedReservationController.getSingleExtendReservationControllers);
router.get("/rmv/:id", extendedReservationController.DeleteSingleExtendReservationControllers);
router.post("/crt", extendedReservationController.createExtendReservationControllers);
router.post("/upt/:id", extendedReservationController.updateSingleExtendReservationControllers);



module.exports = router;