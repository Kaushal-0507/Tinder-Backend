const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth.js");
const ConnectionRequest = require("../models/connectionRequest.js");
const User = require("../models/user.js");
const sendEmail = require("../helper/sendEmail.js");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      const isAllowedStatus = allowedStatus.includes(status);

      if (!isAllowedStatus) {
        return res.status(400).send("ERROR: Status is invalid!!!");
      }

      // Fix: Use consistent variable naming
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).send("ERROR: User not found");
      }

      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingRequest) {
        return res.status(400).send("ERROR: Request Already Exists!!!");
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      await connectionRequest.save();

      // Fix: Proper email content with actual user data
      const emailSubject = `New Connection Request from ${req.user.firstName}`;
      const emailBody = `
        <h3>Hello ${toUser.firstName}!</h3>
        <p>${req.user.firstName} ${req.user.lastName} has shown interest in connecting with you on Stumble.</p>
        <p>Status: ${status}</p>
        <p>Login to your account to review this request.</p>
      `;

      // Fix: Add error handling for email
      try {
        const sendMail = await sendEmail.run(emailSubject, emailBody);
        console.log("Email sent:", sendMail);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Don't fail the request if email fails
      }

      res.status(200).json({
        message: "Connection request sent successfully!",
        data: connectionRequest,
      });
    } catch (error) {
      console.error("Friend request error:", error);
      res.status(400).send("ERROR: " + error.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      const isStatusValid = allowedStatus.includes(status);
      if (!isStatusValid) {
        throw new Error("Status is invalid!!!");
      }

      const requestConnection = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!requestConnection) {
        throw new Error("Connection request does not exist!!!");
      }

      requestConnection.status = status;
      const data = await requestConnection.save();
      res.status(200).json({
        message: "Connection request is " + status,
        data,
      });
    } catch (error) {
      res.status(400).send("ERROR: " + error.message);
    }
  }
);

module.exports = requestRouter;
