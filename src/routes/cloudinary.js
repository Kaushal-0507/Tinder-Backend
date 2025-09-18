const { userAuth } = require("../middlewares/auth");

const express = require("express");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Generate signature endpoint
router.get("/cloudinary/signature", userAuth, (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Optional: Add folder and transformation parameters
    const params = {
      timestamp: timestamp,
      folder: "profiles", // Optional: Organize images in folders
    };

    const signature = cloudinary.v2.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: "profiles",
    });
  } catch (error) {
    console.error("Error generating signature:", error);
    res.status(500).json({ error: "Failed to generate upload signature" });
  }
});

module.exports = router;
