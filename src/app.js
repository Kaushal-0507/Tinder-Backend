require("dotenv").config();
const express = require("express");
const { connectDB } = require("./config/database.js");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");
const userRouter = require("./routes/user.js");
const cors = require("cors");
const router = require("./routes/cloudinary.js");
const paymentRouter = require("./routes/payment.js");
require("./helper/cronJobs.js");
const PORT = 7000;

const app = express();

// Increase payload limit to handle base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", router);
app.use("/", paymentRouter);

connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(PORT, () => {
      console.log("express is successfully running on port 7000...");
    });
  })
  .catch((error) => {
    console.error("Database is not connected " + error.message);
  });
