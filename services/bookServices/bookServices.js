const connectToDb = require("../../database/db");
const {
  default: missingInputs,
} = require("../../utils/missingInputs/missingInputs");
const queryAsync = require("../../utils/queryAysncFunction/queryAsync");
const path = require("path");

module.exports = {
  async insertBookService() {
    try {
      const db = await connectToDb();

      const {
        bookTitle,
        bookSummary,
        bookPrice,
        amountOfPage,
        authorName,
        chargeForADay,
        insertionUserId,
        categoryId,
      } = data.body;
      let bookImg = null;

      if (data.file && data.file.path) {
        bookImg = path.basename(data.file.path);
      }

      const requiredFields = {
        bookTitle,
        bookPrice,
        amountOfPage,
        authorName,
        insertionUserId,
        chargeForADay,
        categoryId,
      };

      for (const [fieldName, fieldValue] of Object.entries(requiredFields)) {
        const missing = missingInputs(fieldValue, fieldName);
        if (missing) {
          return missing;
        }
      }

      const createTableQuery = `
            CREATE TABLE IF NOT EXISTS books (
              id INT AUTO_INCREMENT PRIMARY KEY,
              bookTitle VARCHAR(255) NOT NULL,
              bookSummary VARCHAR(1000) DEFAULT NULL,
              bookPrice DECIMAL(10, 2) NOT NULL,
              amountOfPage INT NOT NULL,
              authorName VARCHAR(255) NOT NULL,
              chargeForADay INT NOT NULL,
              bookThumbnail VARCHAR(255) NOT NULL,
              insertionUserId INT NOT NULL,
              categoryId INT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              is_active BOOLEAN DEFAULT TRUE,
              is_deleted BOOLEAN DEFAULT FALSE,
              FOREIGN KEY (insertionUserId) REFERENCES users(id),
              FOREIGN KEY (categoryId) REFERENCES categories(id)
            )`;
      await queryAsync(db, createTableQuery);

      const checkBooksExistsQuery = "SELECT * FROM books WHERE bookTitle = ?";
      const checkBooksExists = await queryAsync(db, checkBooksExistsQuery, [
        data.body.bookTitle,
      ]);

      if (checkBooksExists.length > 0) {
        db.end();
        return {
          status: 409,
          error: false,
          message: "Book Title Already Exists",
          data: null,
        };
      }

      const insertQuery =
        "INSERT INTO books (bookTitle, bookSummary, bookPrice, amountOfPage, authorName, chargeForADay, bookThumbnail, insertionUserId, categoryId ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

      const bookThumbnail = bookImg;
      const values = [
        data.body.bookTitle,
        data.body.bookSummary,
        data.body.bookPrice,
        data.body.amountOfPage,
        data.body.authorName,
        data.body.chargeForADay,
        bookThumbnail,
        data.body.insertionUserId,
        data.body.categoryId,
      ];

      const insertResult = await queryAsync(db, insertQuery, values);

      if (!insertResult.insertId) {
        return {
          status: 400,
          error: true,
          message: "Failed to insert the Book",
          data: null,
        };
      }

      const fetchBooksQuery = "SELECT * FROM books WHERE id = ?";
      const newBooksResult = await queryAsync(db, fetchBooksQuery, [
        insertResult.insertId,
      ]);

      const newBook = newBooksResult[0];
      return {
        status: 201,
        error: false,
        message: "Books created successfully",
        data: newBook,
      };
    } catch (error) {
      console.log(error, "Insert Book Service Failed");
      return {
        status: 500,
        error: true,
        message: "Insert Book Service Error",
      };
    }
  },

  async getAllBookService() {
    try {
      const db = await connectToDb();
      const q = `SELECT * 
                  FROM books
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
          message: "List of all Books",
        };
      } else {
        return {
          status: 200,
          error: false,
          data: null,
          message: "No Books were Found",
        };
      }
    } catch (error) {
      console.log(error, "Get All Books Service Failed");
      return {
        status: 500,
        error: true,
        message: "Get All Books Service Failed",
        data: null,
      };
    }
  },

  async getSingleBookService(id) {
    try {
      const db = await connectToDb();
      const fetchBooksQuery =
        "SELECT * FROM books WHERE id =? AND is_active = TRUE";
      const bookResults = await queryAsync(db, fetchBooksQuery, [id]);

      if (bookResults.length === 0) {
        db.end();
        return {
          status: 404,
          error: false,
          message: "Book is Not Found under that Id",
          data: null,
        };
      }

      const book = bookResults[0];
      return {
        status: 200,
        error: false,
        message: "Book Found Successfully",
        data: book,
      };
    } catch (error) {
      console.log(error, "Get Single Book By Id Service Failed");
      return {
        status: 500,
        error: true,
        message: "Get Single Book By Id Service Failed",
        data: null,
      };
    }
  },

  async removeBooksService(id) {
    try {
      const db = await connectToDb();
      const checkBookIsAlreadyRemoved =
        "SELECT * FROM books WHERE id =? AND is_deleted = 1";
      const checkBookExists = await queryAsync(db, checkBookIsAlreadyRemoved, [
        id,
      ]);

      if (checkBookExists.length > 0) {
        db.end();
        return {
          status: 409,
          error: false,
          message: "Book is already removed",
          data: null,
        };
      }

      const deleteQuery =
        "UPDATE books SET is_deleted = 1, is_active = 0 WHERE id = ?";
      const deleteResult = await queryAsync(db, deleteQuery, [id]);

      if (!deleteResult.affectedRows) {
        db.end();
        return {
          status: 404,
          error: false,
          message: "Book is Not Found",
          data: null,
        };
      }
    } catch (error) {
      console.log(error, "Remove Books Service Failed");
      return {
        status: 500,
        error: true,
        message: "Remove Books Service Failed",
        data: null,
      };
    }
  },

  //   async updateBooksService(id){
  //     try{
  //         const db = await connectToDb();
  //     }catch(error){
  //         console.log(error, "Update Books Service Failed");
  //         return {
  //           status: 500,
  //           error: true,
  //           message: "Update Books Service Failed",
  //           data: null,
  //         };
  //     }
  //   }
};
