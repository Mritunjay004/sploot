const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./models/user");
const Article = require("./models/Article");

const app = express();
app.use(express.json());

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/backend_assignment", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password, name, age } = req.body;

    // if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: "Email already exists",
      });
    }

    // password encryption
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      age,
    });
    await user.save();

    res.status(201).json({
      statusCode: 201,
      data: {
        data: user,
      },
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An error occurred while signing up",
    });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        statusCode: 401,
        error: "Unauthorized",
        message: "Invalid email or password",
      });
    }

    // for password check
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        statusCode: 401,
        error: "Unauthorized",
        message: "Invalid email or password",
      });
    }

    // JWT token
    const token = jwt.sign({ userId: user._id }, "secret");

    res.status(200).json({
      statusCode: 200,
      data: {
        token,
      },
      message: "Logged in successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An error occurred while logging in",
    });
  }
});

// Create Article
app.post("/api/users/:userId/articles", async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, description } = req.body;

    // if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        error: "Not Found",
        message: "User not found",
      });
    }

    // Creating new
    const article = new Article({
      title,
      description,
      author: user._id,
    });
    await article.save();

    res.status(201).json({
      statusCode: 201,
      data: {
        data: article,
      },
      message: "Article created successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An error occurred while creating the article",
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
