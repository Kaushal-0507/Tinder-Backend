const express = require("express");
const PORT = 7000;

const app = express();
const { connectDB } = require("./config/database.js");
const User = require("./models/user.js");

app.post("/signup", async (req, res) => {
  const newObj = {
    firstName: "Kaushal",
    lastName: "Kishore",
    age: 23,
    password: "12345",
  };

  const user = new User(newObj);

  await user.save();
  res.send("User data is stored");
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
