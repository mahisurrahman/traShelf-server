const connectToDb = require("../../database/db");
const missingInputs = require("../../utils/missingInputs/missingInputs");
const queryAsync = require("../../utils/queryAysncFunction/queryAsync");

module.exports = {
  async createReservationService(body) {
    try {
      const db = await connectToDb();

      const { bookId, userId, reservedDuration, reservedDate, paidAmount } =
        body;

      const requiredFields = {
        bookId,
        userId,
        reservedDuration,
        reservedDate,
        paidAmount,
      };

      for (const [fieldName, fieldValue] of Object.entries(requiredFields)) {
        const missing = missingInputs(fieldValue, fieldName);
        if (missing) {
          return missing;
        }
      }

      // Fetch hourlyRate and dailyRate from the books table
      const bookQuery = "SELECT hourlyRate, dailyRate FROM books WHERE id = ?";
      const bookResult = await queryAsync(db, bookQuery, [bookId]);

      if (bookResult.length === 0) {
        return {
          status: 404,
          error: true,
          message: "Book not found",
          data: null,
        };
      }

      const { hourlyRate, dailyRate } = bookResult[0];

      const createTableQuery = `
            CREATE TABLE IF NOT EXISTS reservations (
              id INT AUTO_INCREMENT PRIMARY KEY,
              bookId INT NOT NULL,
              userId INT NOT NULL,
              chargePerHour INT NOT NULL,
              chargePerDay INT NOT NULL,
              totalAmount INT NOT NULL,
              paidAmount INT NOT NULL,
              dueAmount INT NOT NULL,
              reservedForHours BOOLEAN DEFAULT TRUE,
              reservedForDays BOOLEAN DEFAULT FALSE,
              reservedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              reservedForDate DATE DEFAULT (CURRENT_DATE),
              reservedForTime TIME DEFAULT (CURRENT_TIME),
              reservationComplete BOOLEAN DEFAULT FALSE,
              is_active BOOLEAN DEFAULT TRUE,
              is_deleted BOOLEAN DEFAULT FALSE,
              FOREIGN KEY (bookId) REFERENCES books(id),
              FOREIGN KEY (userId) REFERENCES users(id)
            )`;

      await queryAsync(db, createTableQuery);

      // Insert reservation with fetched hourlyRate and dailyRate
      const insertQuery = `
            INSERT INTO reservations (
              bookId, userId, chargePerHour, chargePerDay, totalAmount, paidAmount, dueAmount, reservedDate,  reservedForHours, reservedForDays, reservedForDate, reservedForTime, reservationComplete
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        bookId,
        userId,
        hourlyRate, // Use hourlyRate from books table
        dailyRate, // Use dailyRate from books table
        totalAmount,
        paidAmount,
        dueAmount,
        reservedForHours,
        reservedForDays,
        reservedDate,
        reservedForDate,
        reservedForTime || new Date().toISOString().slice(11, 19), // Default to current time if not provided
        false,
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
