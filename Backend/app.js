const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Todo = require("./models/Todo"); // Importing Todo model

// Initialize express app
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/checkmate", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// User Schema & Model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

// 🔹 REGISTER / SIGNUP Route
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Both fields are required." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: "1h" });
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 LOGIN Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Both fields are required." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// Default test route
app.get("/", async (req, res) => {
  const todo = new Todo({
    title: "Hey Harsh",
    desc: "Description of todo",
    completed: true,
    dueDate: new Date("1-04-2025"),
  });
  try {
    await todo.save();
    res.send("Todo saved!");
  } catch (err) {
    res.status(500).send("Error saving todo: " + err);
  }
});

// HARSH-CHANGES: Team Task Management Feature
const TaskSchema = new mongoose.Schema({
  title: String,
  assignedTo: String,
  progress: Number, // Percentage of completion
});
const Task = mongoose.model("Task", TaskSchema);

// Assign a task to a random team member
app.post("/assign-task", async (req, res) => {
  const { title, teamMembers } = req.body;
  const assignedTo = teamMembers[Math.floor(Math.random() * teamMembers.length)];
  const task = new Task({ title, assignedTo, progress: 0 });
  await task.save();
  res.json(task);
});

// Update task progress
app.put("/update-progress/:id", async (req, res) => {
  const { progress } = req.body;
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, { progress }, { new: true });
  res.json(updatedTask);
});

// Fetch all tasks
app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});
 
const TeamMember = require("./models/TeamMember"); // HARSH-CHANGES

// HARSH-CHANGES: API to get all team members
app.get("/api/team-members", async (req, res) => {
  try {
    const members = await TeamMember.find();
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// HARSH-CHANGES: API to assign task to a random team member
app.post("/api/assign-task", async (req, res) => {
  try {
      const { taskId } = req.body;

      // Fetch team members
      const members = await TeamMember.find();
      if (members.length === 0) {
          return res.status(400).json({ message: "No team members available." });
      }

      // Assign to a random member
      const randomMember = members[Math.floor(Math.random() * members.length)];

      const task = await Todo.findByIdAndUpdate(
          taskId, 
          { assignedTo: randomMember._id }, 
          { new: true }
      ).populate("assignedTo");

      if (!task) {
          return res.status(404).json({ message: "Task not found." });
      }

      res.json(task);
  } catch (error) {
      console.error("Error assigning task:", error);
      res.status(500).json({ message: error.message });
  }
});


// HARSH-CHANGES: API to update task progress
app.put("/api/update-progress/:taskId", async (req, res) => {
  try {
    const { progress } = req.body;
    const task = await Todo.findByIdAndUpdate(req.params.taskId, { progress }, { new: true });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// HARSH-CHANGES: API to fetch assigned tasks for a team member
app.get("/api/member-tasks/:memberId", async (req, res) => {
  try {
    const tasks = await Todo.find({ assignedTo: req.params.memberId }).populate("assignedTo");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// 🔹 GET all tasks
app.get("/api/todos", async (req, res) => {
  try {
    const tasks = await Todo.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 POST a new task
app.post("/api/todos", async (req, res) => {
  const { title, desc, completed, dueDate } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title is required." });
  }
  const task = new Todo({ title, desc, completed, dueDate });
  try {
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task." });
  }
});

// 🔹 DELETE a task by ID
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const task = await Todo.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE route:", error);
    res.status(500).json({ message: "Error deleting task" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
