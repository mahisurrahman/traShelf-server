const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/categoryControllers/categoryControllers.js");

router.get("/src/all", categoryController.getAllCategoryController);
router.get("/srcById/:id", categoryController.getSingleCategoryController);
router.get("/rmv/:id", categoryController.removeSingleCategoryController);
router.post("/upt/:id", categoryController.updateSingleCategoryController);
router.post("/crt", categoryController.createCategoryController);

module.exports = router;
