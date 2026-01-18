const express = require("express");
const authRouter = express.Router();

const User = require("../models/user.js");
const bcrypt = require("bcrypt");

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 8 * 60 * 60 * 1000,
};

authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const user = new User({ firstName, lastName, email, password });
    const newUser = await user.save();

    const token = await newUser.getJwt();

    res.cookie("token", token, cookieOptions);
    res.send(newUser);
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid Credentials");

    const isPassword = await user.validatePassword(password);
    if (!isPassword) throw new Error("Invalid Credentials");

    const token = await user.getJwt();

    res.cookie("token", token, cookieOptions);
    res.send(user);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 0,
    })
    .send("Logout Successful!!!");
});

module.exports = authRouter;
