const categoryServices = require("../../services/categoryServices/categoryServices.js");
const statusCode = require("../../utils/statusCode/statusCode.js");

const createErrorMessage = (message, data) => {
  return {
    status: statusCode,
    data: data,
    message: message,
    error: true,
  };
};

module.exports = {
  async createCategoryController(req, res) {
    try {
      let response = await categoryServices.createCategoryService(req);
      return res.status(response.status).send(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Create Category Controller Error";
      newError.status = statusCode.internalServerError;
      return res.status(newError.status).json(newError);
    }
  },

  async getAllCategoryController(req, res) {
    try {
      let response = await categoryServices.getAllCategoryService();
      return res.status(response.status).send(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Get All Category Controller Error";
      newError.status = statusCode.internalServerError;
      return res.status(newError.status).json(newError);
    }
  },

  async getSingleCategoryController(req, res) {
    try {
      let response = await categoryServices.getCategoryByIdService(
        req.params.id
      );
      return res.status(response.status).send(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Get Single Category Controller Error";
      newError.status = statusCode.internalServerError;
      return res.status(newError.status).json(newError);
    }
  },

  async removeSingleCategoryController(req, res) {
    try {
      let response = await categoryServices.removeCategoryService(
        req.params.id
      );
      return res.status(response.status).send(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Remove Single Category Controller Error";
      newError.status = statusCode.internalServerError;
      return res.status(newError.status).json(newError);
    }
  },

  async updateSingleCategoryController(req, res) {
    try {
      let response = await categoryServices.updateCategoryService(
        req.params.id
      );
      return res.status(response.status).send(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Remove Single Category Controller Error";
      newError.status = statusCode.internalServerError;
      return res.status(newError.status).json(newError);
    }
  },
};
