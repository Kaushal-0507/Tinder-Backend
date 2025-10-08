const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const userRouter = express.Router();

const USER_SAFE_DATA = [
  "firstName",
  "lastName",
  "photoUrl",
  "age",
  "about",
  "hobbies",
  "photos",
  "gender",
  "membershipType",
  "membershipPeriod",
  "isPremium",
];

userRouter.get("/user/requests", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Check if user is authenticated
    if (!loggedInUser || !loggedInUser._id) {
      return res.status(401).send("ERROR: User not authenticated");
    }

    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    // Filter out requests where fromUserId is null (deleted users)
    const validRequests = connectionRequest.filter(
      (req) => req.fromUserId !== null
    );

    res.json({
      message: "Fetched all connection request successfully!!!",
      data: validRequests,
    });
  } catch (error) {
    console.error("Error in /user/requests:", error);
    res.status(500).send("ERROR: " + error.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Check if user is authenticated
    if (!loggedInUser || !loggedInUser._id) {
      return res.status(401).send("ERROR: User not authenticated");
    }

    const userConnections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    // Filter out any null populated users and ensure data integrity
    const data = userConnections
      .map((row) => {
        // Check if both users exist before processing
        if (!row.fromUserId || !row.toUserId) {
          return null;
        }

        if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
          return row.toUserId;
        }
        return row.fromUserId;
      })
      .filter((user) => user !== null); // Remove any null entries

    res.json({
      message: "Connections fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error in /user/connections:", error);
    res.status(500).send("ERROR: " + error.message);
  }
});

userRouter.get("/user/profile/:userId", userAuth, async (req, res) => {
  try {
    const id = req.params.userId;
    const user = await User.findById(id, USER_SAFE_DATA);
    res.send(user);
  } catch (error) {
    res.status(404).send("ERROR: " + error.message);
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequestUser = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUserFromFeed = new Set();
    connectionRequestUser.forEach((req) => {
      hideUserFromFeed.add(req.fromUserId.toString());
      hideUserFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    }).select(USER_SAFE_DATA);

    res.send(users);
  } catch (error) {
    res.status(404).send("ERROR: " + error.message);
  }
});

module.exports = userRouter;
