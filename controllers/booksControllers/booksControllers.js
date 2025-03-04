const statusCode = require("../../utils/statusCode/statusCode");
const bookServices = require("../../services/bookServices/bookServices.js");

const createErrorMessage = (message, data) => {
  return {
    status: statusCode,
    data: data,
    message: message,
    error: true,
  };
};

module.exports = {
  async insertBookController(req, res) {
    try {
      let response = await bookServices.insertBookService(req);
      return res.status(response.status).send(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Inser Book Controller Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },
};
