const connectToDb = require("../../database/db");
const missingInputs = require("../../utils/missingInputs/missingInputs");
const queryAsync = require("../../utils/queryAysncFunction/queryAsync");

module.exports = {
  async createReservationService(body) {
    try {
      const db = await connectToDb();
      const { bookId, userId, reservedDuration, paidAmount } = body;
      const requiredFields = {
        bookId,
        userId,
        reservedDuration,
        paidAmount,
      };

      for (const [fieldName, fieldValue] of Object.entries(requiredFields)) {
        const missing = missingInputs(fieldValue, fieldName);
        if (missing) {
          return missing;
        }
      }

      const checkExistingQuery = `
        SELECT * FROM reservations 
        WHERE bookId = ? AND userId = ? 
        AND DATE(reservedDate) = CURDATE()`;
      const existingReservations = await queryAsync(db, checkExistingQuery, [
        bookId,
        userId,
      ]);

      if (existingReservations.length > 0) {
        return {
          status: 400,
          error: true,
          message: "You have already reserved this book today",
          data: null,
        };
      }

      // Fetch hourlyRate from the books table
      const bookQuery = "SELECT hourlyRate FROM books WHERE id = ?";
      const bookResult = await queryAsync(db, bookQuery, [bookId]);

      if (bookResult.length === 0) {
        return {
          status: 404,
          error: true,
          message: "Book not found",
          data: null,
        };
      }

      const { hourlyRate } = bookResult[0];
      const totalAmount = hourlyRate * reservedDuration;
      const dueAmount = totalAmount - paidAmount;

      const insertQuery = `
            INSERT INTO reservations (
              bookId, userId, chargePerHour, totalAmount, paidAmount, dueAmount, reservedForHours
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const values = [
        bookId,
        userId,
        hourlyRate,
        totalAmount,
        paidAmount,
        dueAmount,
        reservedDuration,
      ];

      const insertResult = await queryAsync(db, insertQuery, values);
      if (!insertResult.insertId) {
        return {
          status: 400,
          error: true,
          message: "Failed to create the Reservation",
          data: null,
        };
      }

      const fetchReservationQuery = "SELECT * FROM reservations WHERE id = ?";
      const newReservation = await queryAsync(db, fetchReservationQuery, [
        insertResult.insertId,
      ]);

      return {
        status: 201,
        error: false,
        message: "Reservation created successfully",
        data: newReservation[0],
      };
    } catch (error) {
      console.log(error, "Create Reservation Service Failed");
      return {
        status: 500,
        error: true,
        message: "Create Reservation Service Error",
      };
    }
  },

  async getAllReservationServices() {
    try {
      const db = await connectToDb();
      const q = `SELECT * 
                  FROM reservations
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
          message: "List of all Reservations",
        };
      } else {
        return {
          status: 200,
          error: false,
          data: null,
          message: "No reservations were Found",
        };
      }
    } catch (error) {
      console.log(error, "Get All Reservation Service Failed");
      return {
        status: 500,
        error: true,
        message: "Get All Reservation Service Failed",
        data: null,
      };
    }
  },

  async getSingleReservationService(id) {
    try {
      const db = await connectToDb();
      const fetchReservationsQuery =
        "SELECT * FROM reservations WHERE id =? AND is_active = TRUE";
      const reservationLists = await queryAsync(db, fetchReservationsQuery, [id]);

      if (reservationLists.length === 0) {
        db.end();
        return {
          status: 404,
          error: false,
          message: "Reservation is Not Found under that Id",
          data: null,
        };
      }

      const reservation = reservationLists[0];
      return {
        status: 200,
        error: false,
        message: "Reservation Found Successfully",
        data: reservation,
      };
    } catch (error) {
      console.log(error, "Get Single Reservation By Id Service Failed");
      return {
        status: 500,
        error: true,
        message: "Get Single Reservation By Id Service Failed",
        data: null,
      };
    }
  },

  async updateReservationService(reservationId, body) {
    try {
      const db = await connectToDb();

      const checkQuery = "SELECT * FROM reservations WHERE id = ?";
      const reservation = await queryAsync(db, checkQuery, [reservationId]);
      if (reservation.length === 0) {
        return {
          status: 404,
          error: true,
          message: "Reservation not found",
          data: null,
        };
      }

      const validFields = [
        "bookId",
        "userId",
        "chargePerHour",
        "totalAmount",
        "paidAmount",
        "dueAmount",
        "reservedForHours",
        "reservedDate",
        "bookReturned",
        "crossedDeadline",
        "reservationExtention",
      ];

      const updateFields = Object.keys(body).filter((key) =>
        validFields.includes(key)
      );
      if (updateFields.length === 0) {
        return {
          status: 400,
          error: true,
          message: "No valid fields provided for update",
          data: null,
        };
      }

      // Construct the dynamic update query
      const updateQuery = `UPDATE reservations SET ${updateFields
        .map((field) => `${field} = ?`)
        .join(", ")} WHERE id = ?`;

      const values = [
        ...updateFields.map((field) => body[field]),
        reservationId,
      ];
      await queryAsync(db, updateQuery, values);

      // Fetch updated reservation
      const updatedReservation = await queryAsync(db, checkQuery, [
        reservationId,
      ]);

      return {
        status: 200,
        error: false,
        message: "Reservation updated successfully",
        data: updatedReservation[0],
      };
    } catch (error) {
      console.log(error, "Update Reservation Service Failed");
      return {
        status: 500,
        error: true,
        message: "Update Reservation Service Error",
      };
    }
  },

  async deleteReservationService(reservationId) {
    try {
      const db = await connectToDb();

      const checkQuery = "SELECT * FROM reservations WHERE id = ?";
      const reservation = await queryAsync(db, checkQuery, [reservationId]);
      if (reservation.length === 0) {
        return {
          status: 404,
          error: true,
          message: "Reservation not found",
          data: null,
        };
      }

      const updateQuery =
        "UPDATE reservations SET is_active = ?, is_deleted = ? WHERE id = ?";
      await queryAsync(db, updateQuery, [false, true, reservationId]);

      const updatedReservation = await queryAsync(db, checkQuery, [
        reservationId,
      ]);
      return {
        status: 200,
        error: false,
        message: "Reservation deleted successfully",
        data: updatedReservation[0],
      };
    } catch (error) {
      console.log(error, "Delete Reservation Service Failed");
      return {
        status: 500,
        error: true,
        message: "Delete Reservation Service Error",
      };
    }
  },
};
