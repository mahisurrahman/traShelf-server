const statusCode = require("../../utils/statusCode/statusCode.js");
const extendedReservationServices = require("../../services/extensionServices/extensionServices.js");
const createErrorMessage = (message, data) => {
  return {
    status: statusCode,
    data: data,
    message: message,
    error: true,
  };
};

module.exports = {
  async createExtendReservationControllers(req, res) {
    try {
      let response = await extendedReservationServices.createExtendedServices(
        req.body
      );
      return res.status(response.status).send(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Create Extend Reservation Controller Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },

  async getAllExtendReservationControllers(req, res) {
    try {
      let response = await extendedReservationServices.getAllExtndedServices();
      return res.status(response.status).send(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Get All Extend Reservation Controller Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },

  async getSingleExtendReservationControllers(req, res) {
    try {
      let response = await extendedReservationServices.getSingleExtendedService(
        req.params.id
      );
      return res.status(response.status).send(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Get Extend Reservation By Id Controller Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },

  async updateSingleExtendReservationControllers(req, res) {
    try {
      let response = await extendedReservationServices.updateExtendedServices(
        req.params.id,
        req.body
      );
      return res.status(response.status).send(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Update Extend Reservation By Id Controller Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },

  async DeleteSingleExtendReservationControllers(req, res) {
    try {
      let response = await extendedReservationServices.removeExtendedService(
        req.params.id
      );
      return res.status(response.status).send(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Delete Extend Reservation By Id Controller Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },
};
