const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = "your-secret-key"; // In production, use environment variable

app.use(cors());
app.use(express.json());

// Data storage (in production, use a database)
const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const USERS_FILE = path.join(DATA_DIR, "users.json");
const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");

// Helper functions
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Initialize data files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
  writeData(USERS_FILE, []);
}
if (!fs.existsSync(FEEDBACK_FILE)) {
  writeData(FEEDBACK_FILE, []);
}

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Routes

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const users = readData(USERS_FILE);

    if (users.find((user) => user.username === username)) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      role: role || "user",
    };

    users.push(newUser);
    writeData(USERS_FILE, users);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = readData(USERS_FILE);
    const user = users.find((u) => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/auth/verify", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Feedback routes
app.get("/api/feedback", authenticateToken, (req, res) => {
  try {
    const feedback = readData(FEEDBACK_FILE);
    const { category, status, userId } = req.query;

    let filteredFeedback = feedback;

    if (req.user.role !== "admin") {
      filteredFeedback = feedback.filter((f) => f.userId === req.user.id);
    }

    if (category) {
      filteredFeedback = filteredFeedback.filter(
        (f) => f.category === category,
      );
    }

    if (status) {
      filteredFeedback = filteredFeedback.filter((f) => f.status === status);
    }

    if (userId && req.user.role === "admin") {
      filteredFeedback = filteredFeedback.filter((f) => f.userId === userId);
    }

    res.json(filteredFeedback);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/feedback", authenticateToken, (req, res) => {
  try {
    const { title, description, category, rating } = req.body;
    const feedback = readData(FEEDBACK_FILE);

    const newFeedback = {
      id: uuidv4(),
      title,
      description,
      category,
      rating: parseInt(rating),
      status: "pending",
      userId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    feedback.push(newFeedback);
    writeData(FEEDBACK_FILE, feedback);

    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/feedback/:id", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, rating, status } = req.body;
    const feedback = readData(FEEDBACK_FILE);
    const feedbackIndex = feedback.findIndex((f) => f.id === id);

    if (feedbackIndex === -1) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const existingFeedback = feedback[feedbackIndex];

    // Users can only update their own feedback, admins can update any
    if (req.user.role !== "admin" && existingFeedback.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Users can only update content, admins can update status too
    if (req.user.role !== "admin" && status) {
      return res.status(403).json({ message: "Users cannot update status" });
    }

    feedback[feedbackIndex] = {
      ...existingFeedback,
      title: title || existingFeedback.title,
      description: description || existingFeedback.description,
      category: category || existingFeedback.category,
      rating: rating ? parseInt(rating) : existingFeedback.rating,
      status:
        req.user.role === "admin"
          ? status || existingFeedback.status
          : existingFeedback.status,
      updatedAt: new Date().toISOString(),
    };

    writeData(FEEDBACK_FILE, feedback);
    res.json(feedback[feedbackIndex]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/feedback/:id", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const feedback = readData(FEEDBACK_FILE);
    const feedbackIndex = feedback.findIndex((f) => f.id === id);

    if (feedbackIndex === -1) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const existingFeedback = feedback[feedbackIndex];

    // Users can only delete their own feedback, admins can delete any
    if (req.user.role !== "admin" && existingFeedback.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    feedback.splice(feedbackIndex, 1);
    writeData(FEEDBACK_FILE, feedback);

    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Analytics routes (admin only)
app.get("/api/analytics", authenticateToken, (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const feedback = readData(FEEDBACK_FILE);

    const totalFeedback = feedback.length;
    const averageRating =
      feedback.length > 0
        ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
        : 0;

    const categoryDistribution = {};
    const statusDistribution = {};

    feedback.forEach((f) => {
      categoryDistribution[f.category] =
        (categoryDistribution[f.category] || 0) + 1;
      statusDistribution[f.status] = (statusDistribution[f.status] || 0) + 1;
    });

    res.json({
      totalFeedback,
      averageRating: Math.round(averageRating * 10) / 10,
      categoryDistribution,
      statusDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
