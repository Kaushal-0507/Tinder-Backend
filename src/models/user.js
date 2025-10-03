const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userModel = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 25,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 25,
      trim: true,
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
      max: 100, // Increased from 60 to 100 for broader age range
    },
    gender: {
      type: String,

      lowercase: true,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("Gender is invalid");
        }
      },
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
    },
    membershipPeriod: {
      type: String,
    },
    about: {
      type: String,
      default: "This is my about section!!!",
      maxLength: 500, // Added max length for bio
    },
    // Changed from single photoUrl to array of photo URLs
    photos: [
      {
        type: String,
        validate(value) {
          // You might want to adjust this validation if you're sending base64 images
          if (
            value &&
            !validator.isURL(value) &&
            !value.startsWith("data:image/")
          ) {
            throw new Error("Photo URL is invalid: " + value);
          }
        },
      },
    ],
    hobbies: {
      type: [String],
      validate(value) {
        if (value.length > 10) {
          throw new Error("Hobbies cannot be more than 10");
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

// Rest of your methods remain the same
userModel.methods.getJwt = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, "A$CE3D2Y");
  return token;
};

userModel.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    user.password
  );
  return isPasswordValid;
};

// // Pre-save middleware to hash password
userModel.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

module.exports = mongoose.model("User", userModel);
