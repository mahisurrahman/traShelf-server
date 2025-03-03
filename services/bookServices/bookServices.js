const connectToDb = require("../../database/db");
const { default: missingInputs } = require("../../utils/missingInputs/missingInputs");
const queryAsync = require("../../utils/queryAysncFunction/queryAsync");
const path = require("path");

module.exports = {
  async insertBookService() {
    try {
        const db = await connectToDb();

        const { bookTitle, bookSummary, bookPrice, amountOfPage, authorName, insertionUserId, takenUserId, queuedUserId, chargeForADay, categoryId } =
          data.body;
        let imageName = null;
  
        if (data.file && data.file.path) {
          imageName = path.basename(data.file.path);
        }
  
        const requiredFields = {
          postTitle,
          postSummary,
          description,
          userId,
          categoryId,
        };
  
        for (const [fieldName, fieldValue] of Object.entries(requiredFields)) {
          const missing = missingInputs(fieldValue, fieldName);
          if (missing) {
            return missing;
          }
        }
  
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS posts (
              id INT AUTO_INCREMENT PRIMARY KEY,
              postTitle VARCHAR(255) NOT NULL,
              postSummary VARCHAR(1000) NOT NULL,
              description TEXT NOT NULL,
              postThumbnail VARCHAR(255) NOT NULL,
              userId INT NOT NULL,
              categoryId INT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              is_active BOOLEAN DEFAULT TRUE,
              is_deleted BOOLEAN DEFAULT FALSE,
              FOREIGN KEY (userId) REFERENCES users(id),
              FOREIGN KEY (categoryId) REFERENCES categories(id)
            )`;
        await queryAsync(db, createTableQuery);
  
        const checkPostsExistsQuery = "SELECT * FROM posts WHERE postTitle = ?";
        const checkPostsExists = await queryAsync(db, checkPostsExistsQuery, [
          data.body.postTitle,
        ]);
  
        if (checkPostsExists.length > 0) {
          db.end();
          return {
            status: 409,
            error: false,
            message: "Post Title Already Exists",
            data: null,
          };
        }
  
        const insertQuery =
          "INSERT INTO posts (postTitle, postSummary, description, postThumbnail, userId, categoryId) VALUES (?, ?, ?, ?, ?, ?)";
  
        const postThumbnail = imageName;
        const values = [
          data.body.postTitle,
          data.body.postSummary,
          data.body.description,
          postThumbnail,
          data.body.userId,
          data.body.categoryId,
        ];
  
        const insertResult = await queryAsync(db, insertQuery, values);
  
        if (!insertResult.insertId) {
          return {
            status: 400,
            error: true,
            message: "Failed to insert post",
            data: null,
          };
        }
  
        const fetchPostsQuery = "SELECT * FROM posts WHERE id = ?";
        const newPostsResults = await queryAsync(db, fetchPostsQuery, [
          insertResult.insertId,
        ]);
  
        const newPosts = newPostsResults[0];
        return {
          status: 201,
          error: false,
          message: "Post created successfully",
          data: newPosts,
        };
    } catch (error) {
      console.log(error, "Insert Book Service Failed");
      return {
        status: 500,
        error: true,
        message: "Internal Server Error",
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
