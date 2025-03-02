const express = require("express");
const app = express();

require("dotenv").config();

const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

module.exports = { app };
