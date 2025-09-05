const express = require("express");
const PORT = 7000;

const app = express();
const { connectDB } = require("./config/database.js");
const User = require("./models/user.js");

app.use(express.json());

app.post("/signup", async (req, res) => {
  console.log(req.body);
  const user = new User(req.body);

  try {
    await user.save();
    res.send("User data is stored");
  } catch (err) {
    console.log("This is error:", err);
  }
});

connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(PORT, () => {
      console.log("express is successfully running on port 7000...");
    });
  })
  .catch(() => {
    console.error("Database is not connected");
  });
