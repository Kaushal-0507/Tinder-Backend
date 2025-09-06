const express = require("express");
const PORT = 7000;

const app = express();
const { connectDB } = require("./config/database.js");
const User = require("./models/user.js");

app.use(express.json());

app.post("/signup", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    res.send("User data is stored");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//get User => to get One User
app.get("/user", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(404).send("user not found");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(404).send("User not found");
  }
});

//get User => to get One User
app.patch("/user", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ _id: req.body.id }, req.body, {
      runValidators: true,
    });

    res.send("user updated successfully");
  } catch (error) {
    res.status(404).send("User not found " + error.message);
  }
});

//Delete user => deleting a particular user
app.delete("/user", async (req, res) => {
  try {
    const user = await User.deleteOne({ email: req.body.email });
    res.send("user deleted successfully");
  } catch (error) {
    res.status(404).send("User not found");
  }
});

// Get feed => to get all the users
app.get("/feed", async (req, res) => {
  try {
    const user = await User.find({});
    if (!user) {
      res.status(404).send("user not found");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(404).send(error.message);
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
