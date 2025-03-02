const express = require("express");
const multerMiddleware = require("../../middleware/multer.middleware");
const authControllers = require("../../controllers/authControllers/authControllers");
const router = express.Router();

router.post(
  "/register",
  multerMiddleware.single("userImg"),
  authControllers.registerUserController
);
router.post("/login", authControllers.loginUserController);

module.exports = router;
