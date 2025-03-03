const connectToDb = require("../../database/db");
const queryAsync = require("../../utils/queryAysncFunction/queryAsync");


module.exports = {
  async getAllUserService() {
    try {
      const db = await connectToDb();

      const q = "SELECT * FROM users WHERE is_active = TRUE";
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
          message: "Get All Users Success",
        };
      }
    } catch (error) {
      console.log("Get All User Service Error", error);
      return {
        status: 400,
        error: true,
        data: null,
        message: "Get All User Service Error",
      };
    }
  },

  async getSingleUserDetailsService(id) {
    try {
      const db = await connectToDb();

      const fetchPostsQuery =
        "SELECT * FROM users WHERE id =? AND is_active = TRUE";
      const postsResults = await queryAsync(db, fetchPostsQuery, [id]);

      if (postsResults.length === 0) {
        db.end();
        return {
          status: 404,
          error: false,
          message: "User Not Found",
          data: null,
        };
      }

      const post = postsResults[0];
      return {
        status: 200,
        error: false,
        message: "User Found",
        data: post,
      };
    } catch (error) {
      console.log("Get Single User Service Error", error);
      return {
        status: 400,
        error: true,
        data: null,
        message: "Get Single User Service Error",
      };
    }
  },

  async removeSingleUserService(id) {
    try {
      const db = await connectToDb();

      //Check if the user is already deleted or not//
      const checkUserExistsQuery =
        "SELECT * FROM users WHERE id =? AND is_deleted = 1";
      const checkUserExists = await queryAsync(db, checkUserExistsQuery, [id]);

      if (checkUserExists.length > 0) {
        db.end();
        return {
          status: 409,
          error: false,
          message: "User is already removed",
          data: null,
        };
      }

      const deleteQuery =
        "UPDATE users SET is_deleted = 1, is_active = 0 WHERE id = ?";
      const deleteResult = await queryAsync(db, deleteQuery, [id]);

      if (!deleteResult.affectedRows) {
        db.end();
        return {
          status: 404,
          error: false,
          message: "User Not Found",
          data: null,
        };
      }

      return {
        status: 200,
        error: false,
        message: "User removed successfully",
        data: null,
      };
    } catch (error) {
      console.log("Remove Single User Service Error", error);
      return {
        status: 500,
        error: true,
        message: "Remove Single User Service Error",
        data: null,
      };
    }
  },
};
