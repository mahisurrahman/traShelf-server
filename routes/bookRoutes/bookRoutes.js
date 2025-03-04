const express = require("express");
const multerMiddleware = require("../../middleware/multer.middleware");
const bookController = require("../../controllers/booksControllers/booksControllers.js");
const router = express.Router();

router.post(
  "/insert",
  multerMiddleware.single("bookThumbnail"),
  bookController.insertBookController
);

module.exports = router;
