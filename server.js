const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { MONGODB_URL } = require("./config");

const app = express();
app.use(express.json());
const port = 5000;

// setup cors
const corsHandler = cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
  preflightContinue: true,
});

app.use(corsHandler);

// MongoDB Connection
mongoose
  .connect(MONGODB_URL + "ecommerce")
  .then(() => console.log("MongoDBConnected... "))
  .catch((err) => console.log(err));

// routes
const orderRouter = require("./routes/orders");
const productRouter = require("./routes/product");
const imageRouter = require("./routes/image");
const paymentRouter = require("./routes/payment");
const authRouter = require("./routes/auth");

app.use("/orders", orderRouter);
app.use("/products", productRouter);
app.use("/images", imageRouter);
app.use("/payment", paymentRouter);
app.use("/auth", authRouter);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("E-Commerce");
});

// Server listening
app.listen(port, () => console.log(`Server started on port ${port}`));
