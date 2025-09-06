const mongoose = require("mongoose");
const validator = require("validator");

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
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid: " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            "Weak Password: " +
              value +
              "--Password should include minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1"
          );
        }
      },
    },
    age: {
      type: Number,
      min: 18,
      max: 60,
    },
    gender: {
      type: String,
      lowercase: true,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender is invalid");
        }
      },
    },
    about: {
      type: String,
      default: "This is my about section!!!",
    },
    photoUrl: {
      type: String,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Photo URL is invalid: " + value);
        }
      },
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
