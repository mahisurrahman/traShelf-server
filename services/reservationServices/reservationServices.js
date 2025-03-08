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

      const createTableQuery = `
            CREATE TABLE IF NOT EXISTS reservations (
              id INT AUTO_INCREMENT PRIMARY KEY,
              bookId INT NOT NULL,
              userId INT NOT NULL,
              chargePerHour INT NOT NULL,
              totalAmount INT NOT NULL,
              paidAmount INT NOT NULL,
              dueAmount INT NOT NULL,
              reservedForHours INT NOT NULL,
              reservedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              reservationComplete BOOLEAN DEFAULT FALSE,
              crossedDeadline BOOLEAN DEFAULT FALSE,
              extendedDuration INT DEFAULT 0,
              extendedDeadlineCharge INT DEFAULT 6,
              extendedTimeLineCosts INT DEFAULT 0,
              finalCostsWithExtension INT DEFAULT 0,
              is_active BOOLEAN DEFAULT TRUE,
              is_deleted BOOLEAN DEFAULT FALSE,
              FOREIGN KEY (bookId) REFERENCES books(id),
              FOREIGN KEY (userId) REFERENCES users(id)
            )`;

      await queryAsync(db, createTableQuery);
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
};
