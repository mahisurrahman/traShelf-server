require("dotenv").config();
const mysql = require("mysql");

const connectToDb = () => {
  return new Promise((resolve, reject) => {
    const db = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      database: "traBlog",
    });

    db.connect((err) => {
      if (err) {
        console.log("Database connection failed", err);
        reject(err);
      } else {
        // console.log("Connected to the database");
        resolve(db);
      }
    });
  });
};

module.exports = connectToDb;