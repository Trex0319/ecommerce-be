const express = require("express");
const axios = require("axios");
const router = express.Router();

const Order = require("../models/order");

const {
  BILLPLZ_API_URL,
  BILLPLZ_API_KEY,
  BILLPLZ_COLLECTION_ID,
} = require("../config");

router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }
    res.status(200).send(await Order.find(filter).populate("products"));
  } catch (error) {
    res.status(400).send({ message: "Order not found" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await Order.findOne({ _id: req.params.id });
    res.status(200).send(data);
  } catch (error) {
    res.status(400).send({ message: "Order not found" });
  }
});

router.post("/", async (req, res) => {
  try {
    // call the billplz API to create a bill
    const billplz = await axios({
      method: "POST",
      url: BILLPLZ_API_URL + "v3/bills",
      auth: {
        username: BILLPLZ_API_KEY,
        password: "",
      },
      data: {
        collection_id: BILLPLZ_COLLECTION_ID,
        email: req.body.customerEmail,
        name: req.body.customerName,
        amount: parseFloat(req.body.totalPrice) * 100,
        description: "Payment for order",
        callback_url: "http://localhost:3000/verify-payment",
        redirect_url: "http://localhost:3000/verify-payment",
      },
    });
    // Create the order in database
    const newOrder = new Order({
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      products: req.body.products,
      totalPrice: req.body.totalPrice,
      billplz_id: billplz.data.id, // store the billplz ID in our order
    });

    await newOrder.save();
    res.status(200).send(billplz.data);
  } catch (error) {
    res.status(400).send({
      message: error._message
        ? error._message
        : error.response.data.error.message[0],
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const order_id = req.params.id;

    const updatedOrder = await Order.findByIdAndUpdate(order_id, req.body, {
      new: true,
    });
    res.status(200).send(updatedOrder);
  } catch (error) {
    res.status(400).send({ message: error._message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const order_id = req.params.id;

    const deleteOrder = await Order.findByIdAndDelete(order_id);
    res.status(200).send(deleteOrder);
  } catch (error) {
    res.status(400).send({ message: error._message });
  }
});

module.exports = router;
