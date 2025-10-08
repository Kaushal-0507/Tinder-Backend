const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

chatRouter.post("/getChat", userAuth, async (req, res) => {
  const { toUserId } = req.body;
  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, toUserId] },
    }).populate({
      path: "message.senderId",
      select: "firstName",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, toUserId],
        message: [],
      });
    }
    await chat.save();
    res.json({ chat });
  } catch (error) {
    console.log(error);
  }
});

module.exports = chatRouter;
