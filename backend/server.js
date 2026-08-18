const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ================= MONGODB CONNECTION =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// ================= USER MODEL =================

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

// ================= JWT SECRET =================

const JWT_SECRET = process.env.JWT_SECRET || "resume_analyser_secret";

// ================= UPLOADS FOLDER =================

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ================= FILE STORAGE =================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// ================= TEST ROUTE =================

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// =====================================================
// REGISTER
// =====================================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email: normalizedEmail,
      password: hashedPassword,
    });

    // IMPORTANT:
    // Register ke time JWT/token nahi dena.
    // User ko pehle Login karna padega.

    return res.status(201).json({
      message: "Registration successful. Please login.",
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
});

// =====================================================
// LOGIN
// =====================================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
});

// =====================================================
// JWT MIDDLEWARE
// =====================================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
};

// =====================================================
// UPLOAD API - PROTECTED
// =====================================================

app.post(
  "/upload",
  authenticateToken,
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
        });
      }

      const dataBuffer = fs.readFileSync(req.file.path);

      const data = await pdfParse(dataBuffer);

      let text = data.text.toLowerCase();

      // ================= SKILLS =================

      const skillsList = [
        "react",
        "node",
        "mongodb",
        "javascript",
        "python",
        "java",
        "html",
        "css",
        "sql",
        "electrician",
        "express",
        "bootstrap",
        "tailwind",
        "figma",
        "git",
        "github",
        "api",
        "firebase",
      ];

      const skills = skillsList.filter((skill) =>
        text.includes(skill)
      );

      // ================= SECTIONS CHECK =================

      const sections = {
        education:
          text.includes("education") ||
          text.includes("degree") ||
          text.includes("college"),

        projects:
          text.includes("project") ||
          text.includes("portfolio") ||
          text.includes("application"),

        experience:
          text.includes("experience") ||
          text.includes("internship") ||
          text.includes("work"),

        skills: text.includes("skills"),

        summary:
          text.includes("summary") ||
          text.includes("profile") ||
          text.includes("objective"),

        certifications:
          text.includes("certification") ||
          text.includes("certificate"),
      };

      // ================= SCORE =================

      let score = 0;

      score += Math.min(skills.length * 4, 24);

      if (sections.education) score += 8;
      if (sections.projects) score += 10;
      if (sections.experience) score += 10;
      if (sections.skills) score += 8;
      if (sections.summary) score += 6;
      if (sections.certifications) score += 4;

      if (text.includes("linkedin") || text.includes("@")) {
        score += 5;
      }

      if (text.includes("%") || text.includes("improved")) {
        score += 5;
      }

      if (text.length > 500) {
        score += 8;
      }

      if (score > 80) {
        score = 80;
      }

      // ================= SUGGESTIONS =================

      const suggestions = [];

      if (!sections.summary) {
        suggestions.push(
          "Add a strong professional summary at the top."
        );
      }

      if (!sections.education) {
        suggestions.push(
          "Include Education section."
        );
      }

      if (!sections.projects) {
        suggestions.push(
          "Add project details."
        );
      }

      if (!sections.experience) {
        suggestions.push(
          "Mention experience or internships."
        );
      }

      if (!sections.certifications) {
        suggestions.push(
          "Add certifications."
        );
      }

      if (skills.length < 3) {
        suggestions.push(
          "Add more technical skills."
        );
      }

      if (!text.includes("linkedin")) {
        suggestions.push(
          "Add LinkedIn profile."
        );
      }

      if (
        !text.includes("%") &&
        !text.includes("improved")
      ) {
        suggestions.push(
          "Use measurable achievements."
        );
      }

      if (text.length < 500) {
        suggestions.push(
          "Resume is too short, add more details."
        );
      }

      if (suggestions.length < 2) {
        suggestions.push(
          "Improve formatting consistency."
        );

        suggestions.push(
          "Customize resume per job."
        );
      }

      // ================= GOOD POINTS =================

      const goodPoints = [];

      if (text.length > 500) {
        goodPoints.push({
          title: "Detailed Content",
          text: "Good amount of information present.",
        });
      }

      if (skills.length >= 2) {
        goodPoints.push({
          title: "Technical Skills",
          text: `You have ${skills.length} skills.`,
        });
      }

      if (sections.projects) {
        goodPoints.push({
          title: "Projects",
          text: "Projects are included.",
        });
      }

      if (sections.experience) {
        goodPoints.push({
          title: "Experience",
          text: "Experience present.",
        });
      }

      if (sections.education) {
        goodPoints.push({
          title: "Education",
          text: "Education included.",
        });
      }

      if (
        text.includes("linkedin") ||
        text.includes("@")
      ) {
        goodPoints.push({
          title: "Contact Info",
          text: "Contact details present.",
        });
      }

      if (goodPoints.length === 0) {
        goodPoints.push({
          title: "Basic Structure",
          text: "Resume structure is okay.",
        });
      }

      // ================= RESPONSE =================

      res.json({
        score,
        skills,
        suggestions,
        sections,
        goodPoints,
        fileName: req.file.originalname,
      });
    } catch (error) {
      console.error("ANALYSIS ERROR:", error);

      res.status(500).json({
        message: "Error analyzing resume",
      });
    }
  }
);

// ================= SERVER START =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});