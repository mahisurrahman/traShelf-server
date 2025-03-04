const authServices = require("../../services/authServices/authServices.js");
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
  async registerUserController(req, res) {
    try {
      // console.log(req.body, "body");
      // console.log(req.file, "file");
      let response = await authServices.registerUserService(req);
      return res.status(response.status).send(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Register User Controller Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },

  async loginUserController(req, res) {
    try {
      let response = await authServices.loginUserService(req.body);
      if (!response.error) {
        res.cookie("access_token", response.token, {
          httpOnly: true,
        });
      }
      return res.status(response.status).json(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Login User Controller Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },
};
