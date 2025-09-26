const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentInstance = require("../helper/razorpay");
const PaymentModel = require("../models/paymentModel");
const { membershipAmount } = require("../helper/constants");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const User = require("../models/user");

const paymentRouter = express.Router();

paymentRouter.post("/payment/order", userAuth, async (req, res) => {
  try {
    const { membershipType, period } = req.body;

    const amount = membershipAmount[period]?.[membershipType];

    const { firstName, lastName, email } = req.user;
    const order = await paymentInstance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "stumble_receipt",
      notes: {
        firstName,
        lastName,
        membershipPeriod: period,
        membershipType: membershipType,
      },
    });

    const payment = new PaymentModel({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    res.json({
      ...savedPayment.toJSON(),
      keyId: process.env.RAZORPAY_ACCESS_ID,
    });
  } catch (error) {
    console.log(error);
  }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    webhookSignature = req.get("X-Razorpay-Signature");
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.WEBHOOK_SECRET_KEY
    );

    if (!isWebhookValid) {
      console.log("Invalid Webhook Signature");
      return res.status(400).json({ msg: "Webhook signature is invalid" });
    }

    const paymentDetails = req.body.payload.payment.entity;

    const payment = await PaymentModel.findOne({
      orderId: paymentDetails.order_id,
    });
    payment.status = paymentDetails.status;
    await payment.save();
    console.log("payment saved");

    const user = await User.findOne({ _id: payment.userId });
    (user.isPremium = true),
      (user.membershipType = paymentDetails.notes.membershipType),
      (user.membershipPeriod = paymentDetails.notes.period);
    await user.save();
    console.log("user saved");

    return res.status(200).json({ msg: "Webhook received successfully" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

module.exports = paymentRouter;
