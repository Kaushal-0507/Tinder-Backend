const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");

const userModel = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 25,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 25,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (
          !value.includes("@") ||
          !value.includes(".") ||
          !value.endsWith(".com")
        ) {
          throw new Error("Email should include @ and end with .com");
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
    },
    gender: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      default: "This is my about section!!!",
    },
    photoUrl: {
      type: String,
      default: "",
    },
    hobbies: {
      type: [String],
    },
  },

  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("User", userModel);
