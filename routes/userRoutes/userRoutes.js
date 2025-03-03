const express = require("express");
const userControllers = require("../../controllers/userControllers/userControllers");
const router = express.Router();

router.get("/src/all", userControllers.getAllUsersControllers);
router.get("/srcById/:id", userControllers.getUserByIdControllers);
router.get("/delById/:id", userControllers.deleteUserByIdControllers)

module.exports = router;
