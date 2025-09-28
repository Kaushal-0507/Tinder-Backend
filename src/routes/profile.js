const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth.js");
const { validateEditProfile } = require("../helper/validate.js");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfile(req)) {
      throw new Error("Invalid field request!!!");
    }

    const userId = req.user._id;

    // Alternative approach using findByIdAndUpdate
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators
    });

    if (!updatedUser) {
      throw new Error("User not found");
    }

    res.json({
      message: `${updatedUser.firstName} your profile is updated successfully!!!`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(400).send("Error: " + error.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const isPasswordValid = await user.validatePassword(req.body?.oldPassword);
    if (!isPasswordValid) {
      throw new Error("Your old password is incorrect!!!!");
    }

    const hashPassword = await bcrypt.hash(req.body?.newPassword, 10);

    user.password = hashPassword;
    await user.save();
    res.send("New password is set successfully!!!");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

profileRouter.delete("/profile/user/delete", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const isPasswordValid = await user.validatePassword(req?.body?.oldPassword);
    if (!isPasswordValid) {
      throw new Error("Your old password is incorrect!");
    }

    await User.findByIdAndDelete(user?._id);
    res
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    res.send("User deleted successfully!");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

module.exports = profileRouter;
