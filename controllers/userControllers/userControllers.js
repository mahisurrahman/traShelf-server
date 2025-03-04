const userServices = require("../../services/userServices/userServices");
const statusCode = require ("../../utils/statusCode/statusCode.js");

const createErrorMessage = (message, data) => {
  return {
    status: statusCode,
    data: data,
    message: message,
    error: true,
  };
};

module.exports = {
  async getAllUsersControllers(req, res) {
    try {
      let response = await userServices.getAllUserService();
      return res.status(response.status).send(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Get All User Controller Service Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },
  async getUserByIdControllers(req, res) {
    try {
      let response = await userServices.getSingleUserDetailsService(
        req.params.id
      );
      return res.status(response.status).send(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Get User By Id Controller Service Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },
  async deleteUserByIdControllers(req, res) {
    try {
      let response = await userServices.removeSingleUserService(
        req.params.id
      );
      return res.status(response.status).send(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Delete User By Id Controller Service Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },
};
