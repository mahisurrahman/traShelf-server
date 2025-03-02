
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const connectToDb = require("../../database/db.js");
const queryAsync = require("../../utils/queryAysncFunction/queryAsync.js");
const missingInputs = require("../../utils/missingInputs/missingInputs.js");

module.exports = {
  async registerUserService(data) {
    try {
      const db = await connectToDb();
      const {
        firstName,
        lastName,
        phoneNumber,
        userRole,
        username,
        email,
        password,
      } = data.body;

      let imageName = null;

      if (data.file && data.file.path) {
        imageName = path.basename(data.file.path);
      }

      //Ensure if any input field is missing//
      const requiredFields = {
        firstName,
        lastName,
        phoneNumber,
        userRole,
        username,
        email,
        password,
      };
      for (const [fieldName, fieldValue] of Object.entries(requiredFields)) {
        const missing = missingInputs(fieldValue, fieldName);
        if (missing) {
          return missing;
        }
      }

      // Ensure Database Model Exists
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          firstName VARCHAR(225) NOT NULL,
          lastName VARCHAR(225) NOT NULL,
          userImg VARCHAR(225) NOT NULL,
          phoneNumber VARCHAR(225) NOT NULL,
          userRole INT NOT NULL,
          username VARCHAR(50) NOT NULL UNIQUE,
          email VARCHAR(100) NOT NULL UNIQUE,
          password TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT TRUE,
          is_deleted BOOLEAN DEFAULT FALSE
        );`;
      await queryAsync(db, createTableQuery);

      // Check Existing User
      const checkQuery = "SELECT * FROM users WHERE email = ? OR username = ?";
      const existingUsers = await queryAsync(db, checkQuery, [
        data.body.email,
        data.body.username,
      ]);
      if (existingUsers.length > 0) {
        db.end();
        return {
          status: 409,
          error: false,
          message: "User Already Exists",
          data: existingUsers,
        };
      }

      // Hashing Password
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(data.body.password, salt);

      // Insert user's data to the DB
      const insertQuery = `
        INSERT INTO users (firstName, lastName, userRole, userImg, phoneNumber, username, email, password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      const userImg = imageName;

      const values = [
        data.body.firstName,
        data.body.lastName,
        data.body.userRole,
        userImg,
        data.body.phoneNumber,
        data.body.username,
        data.body.email,
        hash,
      ];
      const insertResult = await queryAsync(db, insertQuery, values);

      // Make sure insertId exists
      if (!insertResult.insertId) {
        return {
          status: 400,
          error: true,
          message: "Failed to insert user",
          data: null,
        };
      }

      // Fetch the new user data
      const fetchUserQuery = "SELECT * FROM users WHERE id = ?";
      const newUserResults = await queryAsync(db, fetchUserQuery, [
        insertResult.insertId,
      ]);
      const newUser = newUserResults[0];

      return {
        status: 201,
        error: false,
        message: "User created successfully",
        data: newUser,
      };
    } catch (error) {
      console.log("Register User Service Error", error);
      return {
        status: 400,
        error: true,
        data: null,
        message: "Register User Service Error",
      };
    }
  },

  async loginUserService(body) {
    try {
      const db = await connectToDb();
      // Check User Exists
      const q = "SELECT * FROM users WHERE email = ? AND is_active = 1";
      const userExists = await queryAsync(db, q, [body.email]);

      if (userExists.length === 0) {
        return {
          status: 404,
          error: true,
          message: "User not found",
          data: null,
        };
      }

      //Check Password//
      const isPassCorrect = bcrypt.compareSync(
        body.password,
        userExists[0].password
      );

      if (!isPassCorrect) {
        return {
          status: 400,
          error: true,
          message: "Password does not match",
          data: null,
        };
      }

      const token = jwt.sign({ id: userExists[0].id }, "jwtkey");
      const { password, ...other } = userExists[0];

      return {
        status: 200,
        error: false,
        message: "Login Successful",
        data: {
          other,
          token,
        },
      };
    } catch (error) {
      console.log("Login User Service Error", error);
      return {
        status: 400,
        error: true,
        data: null,
        message: "Login User Service Error",
      };
    }
  },
};