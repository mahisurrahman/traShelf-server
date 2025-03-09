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

  async getAllExtndedServices() {
    try {
      const db = await connectToDb();
      const q = `SELECT * 
                    FROM extendedReservations
                    WHERE is_active = TRUE;
                    `;

      const results = await new Promise((resolve, reject) => {
        db.query(q, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
      if (results.length > 0) {
        return {
          status: 200,
          error: false,
          data: results,
          message: "List of all Extended Reservations Deadlines",
        };
      } else {
        return {
          status: 200,
          error: false,
          data: null,
          message: "No Extended reservation deadlines were Found",
        };
      }
    } catch (error) {
      console.error(error, "Get All Extended Services Failed");
      return {
        status: 500,
        error: true,
        message: "Get All Extended Services Failed",
        data: null,
      };
    }
  },

  async getSingleExtendedService(id) {
    try {
      const db = await connectToDb();
      const fetchExtendedReservationQuery =
        "SELECT * FROM extendedReservations WHERE id = ? AND is_active = TRUE";
      const extendedReservationsList = await queryAsync(
        db,
        fetchExtendedReservationQuery,
        [id]
      );
      if (extendedReservationsList.length === 0) {
        db.end();
        return {
          status: 404,
          error: false,
          message: "No Extended Services Found Under this Id",
          data: null,
        };
      }

      const extendedServices = extendedReservationsList[0];
      return {
        status: 200,
        error: false,
        message: "Extended Service Found Successfully",
        data: extendedServices,
      };
    } catch (error) {
      console.error(error, "Get Single Extended Service Failed");
      return {
        status: 500,
        error: true,
        message: "Get Single Extended Service Failed",
        data: null,
      };
    }
  },

  async updateExtendedServices(id, data) {
    try {
      const db = await connectToDb();

      const {
        extendedPaid,
        extendedDue,
        bookReturned,
        extendedByAdmin,
        extendedByDeadlineCross,
      } = data;

      // Check if at least one field is provided for update
      if (
        extendedPaid === undefined &&
        extendedDue === undefined &&
        bookReturned === undefined &&
        extendedByAdmin === undefined &&
        extendedByDeadlineCross === undefined
      ) {
        return res.status(400).json({
          status: 400,
          error: true,
          message: "At least one field is required to update.",
        });
      }

      // Construct dynamic update query
      let updateFields = [];
      let values = [];

      if (extendedPaid !== undefined) {
        updateFields.push("extendedPaid = ?");
        values.push(extendedPaid);
      }
      if (extendedDue !== undefined) {
        updateFields.push("extendedDue = ?");
        values.push(extendedDue);
      }
      if (bookReturned !== undefined) {
        updateFields.push("bookReturned = ?");
        values.push(bookReturned);
      }
      if (extendedByAdmin !== undefined) {
        updateFields.push("extendedByAdmin = ?");
        values.push(extendedByAdmin);
      }
      if (extendedByDeadlineCross !== undefined) {
        updateFields.push("extendedByDeadlineCross = ?");
        values.push(extendedByDeadlineCross);
      }

      values.push(id); // Add ID to values array for WHERE clause

      const updateQuery = `
        UPDATE extendedReservations 
        SET ${updateFields.join(", ")} 
        WHERE id = ?
      `;

      const updateResult = await queryAsync(db, updateQuery, values);

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({
          status: 404,
          error: true,
          message: "Extended reservation not found or no changes applied.",
        });
      }

      // Fetch the updated record
      const fetchUpdatedQuery =
        "SELECT * FROM extendedReservations WHERE id = ?";
      const updatedReservation = await queryAsync(db, fetchUpdatedQuery, [id]);

      return res.status(200).json({
        status: 200,
        error: false,
        message: "Extended reservation updated successfully.",
        data: updatedReservation[0],
      });
    } catch (error) {
      console.error(error, "Update Extended Service Failed");
      return res.status(500).json({
        status: 500,
        error: true,
        message: "Update Extended Service Failed",
      });
    }
  },

  async removeExtendedService(id) {
    try {
      const db = await connectToDb();
      const checkQuery = "SELECT * FROM extendedReservations WHERE id = ?";
      const reservation = await queryAsync(db, checkQuery, [id]);
      if (reservation.length === 0) {
        return {
          status: 404,
          error: true,
          message: "Extended Reservation not found",
          data: null,
        };
      }

      const updateQuery =
        "UPDATE extendedReservations SET is_active = ?, is_deleted = ? WHERE id = ?";
      await queryAsync(db, updateQuery, [false, true, id]);

      const updatedExtendedReservation = await queryAsync(db, checkQuery, [id]);
      return {
        status: 200,
        error: false,
        message: "Reservation deleted successfully",
        data: updatedExtendedReservation[0],
      };
    } catch (error) {
      console.error(error, "Remove Extended Service Failed");
      return res.status(500).json({
        status: 500,
        error: true,
        message: "Remove Extended Service Failed",
      });
    }
  },
};
