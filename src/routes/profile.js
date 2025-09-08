const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth.js");
const { validateEditProfile } = require("../helper/validate.js");
const user = require("../models/user.js");
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

    const loggedInUser = req.user;

    Object.keys(req.body).every((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    res.json({
      message: `${loggedInUser.firstName} your profile updated successfully!!!`,
      data: loggedInUser,
    });
  } catch (error) {
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

module.exports = profileRouter;
