const express = require("express");
const PORT = 7000;

const app = express();
const { connectDB } = require("./config/database.js");
const User = require("./models/user.js");

app.use(express.json());

app.post("/signup", async (req, res) => {
  try {
    const userObj = req.body;
    const allowedFields = ["firstName", "lastName", "password", "email"];
    const isAllowed = Object.keys(userObj).every((k) =>
      allowedFields.includes(k)
    );
    if (!isAllowed) {
      throw new Error("SignUp is not accurate!!");
    }
    const user = new User(userObj);
    await user.save();
    res.send("User data is stored");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post("/signin", async (req, res) => {
  try {
    const userObj = req.body;
    const allowedFields = [
      "firstName",
      "lastName",
      "password",
      "email",
      "age",
      "photoUrl",
      "gender",
      "hobbies",
      "about",
    ];
    const isAllowed = Object.keys(userObj).every((k) =>
      allowedFields.includes(k)
    );
    if (!isAllowed) {
      throw new Error("SignIn is invalid!!");
    }
    const user = new User(userObj);
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
app.patch("/user/:id", async (req, res) => {
  const userId = req.params?.id;
  try {
    const userObj = req.body;
    const allowedFields = ["gender", "hobbies", "photoUrl", "about"];
    const isAllowed = Object.keys(userObj).every((k) =>
      allowedFields.includes(k)
    );
    if (!isAllowed) {
      throw new Error("Update is unsuccessful");
    }

    if (userObj?.hobbies?.length > 10) {
      throw new Error("Hobbies cannot be more than 10");
    }
    const user = await User.findOneAndUpdate({ _id: userId }, userObj, {
      runValidators: true,
    });

    res.send("user updated successfully");
  } catch (error) {
    res.status(404).send(error.message);
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
