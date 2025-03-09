const connectToDb = require("../../database/db");
const missingInputs = require("../../utils/missingInputs/missingInputs");
const queryAsync = require("../../utils/queryAysncFunction/queryAsync");

module.exports = {
  async createExtendedServices() {
    try {
      const db = await connectToDb();

      const {
        reservationId,
        extendedDuration,
        extendedDeadlineCharge,
        extendedPaid,
        extendedByAdmin,
        extendedByDeadlineCross,
      } = req.body;

      const requiredFields = {
        reservationId,
        extendedDuration,
        extendedDeadlineCharge,
        extendedPaid,
        extendedByAdmin,
        extendedByDeadlineCross,
      };

      for (const [fieldName, fieldValue] of Object.entries(requiredFields)) {
        const missing = missingInputs(fieldValue, fieldName);
        if (missing) {
          return missing;
        }
      }

      const extendedTotalCosts = extendedDeadlineCharge * extendedDuration;
      const extendedDue = extendedTotalCosts - extendedPaid;

      const createTableQuery = `
    CREATE TABLE IF NOT EXISTS extendedReservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reservationId INT NOT NULL,
        extendedDuration INT NOT NULL,
        extendedDeadlineCharge INT NOT NULL,
        extendedTotalCosts INT NOT NULL,
        extendedPaid INT NOT NULL,
      extendedDue INT NOT NULL,
      bookReturned BOOLEAN DEFAULT FALSE,
      extendedByAdmin BOOLEAN DEFAULT FALSE, 
      extendedByDeadlineCross BOOLEAN DEFAULT FALSE,
      extendedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      is_deleted BOOLEAN DEFAULT FALSE,
      )`;

      await queryAsync(db, createTableQuery);
      const insertQuery = `
      INSERT INTO extendedReservations (
      reservationId, extendedDuration, extendedDeadlineCharge, extendedTotalCosts, extendedPaid, extendedDue) VALUES (?, ?, ?, ?, ?, ?)`;

      const values = [
        reservationId,
        extendedDuration,
        extendedDeadlineCharge,
        extendedTotalCosts,
        extendedPaid,
        extendedDue,
      ];

      const insertResult = await queryAsync(db, insertQuery, values);
      if (!insertResult.insertId) {
        return {
          status: 400,
          error: true,
          message: "Failed to create Extended Service",
          data: null,
        };
      }

      const fetchExtensionQuery =
        "SELECT * FROM extendedReservations WHERE id = ?";
      const newExtendedReservations = await queryAsync(
        db,
        fetchExtensionQuery,
        [insertResult.insertId]
      );

      return {
        status: 201,
        error: false,
        message: "Extended Service created successfully",
        data: newExtendedReservations[0],
      };
    } catch (error) {
      console.error(error, "Create Extended Service Failed");
      return {
        status: 500,
        error: true,
        message: "Create Extended Service Failed",
        data: null,
      };
    }
  },
};
