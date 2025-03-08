const statusCode = require("../../utils/statusCode/statusCode.js");
const reservationServices = require("../../services/reservationServices/reservationServices.js");

const createErrorMessage = (message, data) => {
  return {
    status: statusCode,
    data: data,
    message: message,
    error: true,
  };
};

module.exports = {
  async createReservationControllers(req, res) {
    try {
      let response = await reservationServices.createReservationService(
        req.body
      );
      return res.status(response.status).send(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Create Reservation Controller Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },
};
