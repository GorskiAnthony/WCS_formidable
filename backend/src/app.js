const express = require("express");
const app = express();
const logger = require("morgan");
const cors = require("cors");
const mainRouter = require("./router/index");

app.use(logger("dev"));
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

app.use("/files", mainRouter);

module.exports = app;
