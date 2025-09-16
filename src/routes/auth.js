const express = require("express");
const authRouter = express.Router();

const User = require("../models/user.js");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  try {
    const userObj = req.body;
    const { firstName, lastName, email, password } = userObj;
    const allowedFields = ["firstName", "lastName", "password", "email"];
    const isAllowed = Object.keys(userObj).every((k) =>
      allowedFields.includes(k)
    );
    if (!isAllowed) {
      throw new Error("SignUp is invalid!!");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPassword = await user.validatePassword(password);
    if (!isPassword) {
      throw new Error("Invalid Credentials");
    }

    const token = await user.getJwt();

    res.cookie("token", token);

    res.send(user);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .send("Logout Successful!!!");
});

module.exports = authRouter;
