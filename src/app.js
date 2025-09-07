const express = require("express");
const bcrypt = require("bcrypt");
const { connectDB } = require("./config/database.js");
const User = require("./models/user.js");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth.js");

const PORT = 7000;

const app = express();

app.use(express.json());
app.use(cookieParser());

// Post user => signup user
app.post("/signup", async (req, res) => {
  try {
    const userObj = req.body;
    const { firstName, lastName, email, password } = userObj;
    const allowedFields = ["firstName", "lastName", "password", "email"];
    const isAllowed = Object.keys(userObj).every((k) =>
      allowedFields.includes(k)
    );
    if (!isAllowed) {
      throw new Error("SignUp is invalid!!");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });
    await user.save();
    res.send("User data is stored");
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

//post login => login user
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      throw new Error("Invalid Credentials");
    }

    const token = jwt.sign({ _id: user._id }, "A$CE3D2Y");

    res.cookie("token", token);

    res.send("Login Successful");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

// Get profile => get method to get user profile
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

app.post("/sentConnectionRequest", userAuth, (req, res) => {
  res.send("connection request sent");
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
    res.status(404).send("ERROR: " + error.message);
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
    res.status(404).send("ERROR: " + error.message);
  }
});

//Delete user => deleting a particular user
app.delete("/user", async (req, res) => {
  try {
    const user = await User.deleteOne({ email: req.body.email });
    res.send("user deleted successfully");
  } catch (error) {
    res.status(404).send("ERROR: " + error.message);
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
    res.status(404).send("ERROR: " + error.message);
  }
});

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
