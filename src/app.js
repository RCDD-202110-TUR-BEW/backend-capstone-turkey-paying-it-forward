const express = require("express");
require("dotenv").config();

const connectToMongo = require("./db/connection");

const authRoutes = require("./routers/auth");
const itemRoutes = require("./routers/item");
const userRoutes = require("./routers/user");
const globalRoutes = require("./routers/global");

const app = express();
const port = process.env.NODE_LOCAL_PORT;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", itemRoutes);
app.use("/api", userRoutes);
app.use(globalRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  connectToMongo();
});

module.exports = app;
