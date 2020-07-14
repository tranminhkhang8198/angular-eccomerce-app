const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders:
      "Content-Type, Authorization, Origin, X-Requested-With, Accept",
  })
);

// Import Routes
const productsRoute = require("./routes/products");
const ordersRoute = require("./routes/orders");
const usersRoute = require("./routes/users");
const authRouter = require("./routes/auth");

// Use Routes
app.use("/api/products", productsRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRoute);

module.exports = app;
