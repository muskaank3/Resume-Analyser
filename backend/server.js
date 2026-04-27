const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
require("dotenv").config();

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

app.use(cors());

// ✅ IMPORTANT: uploads folder auto create
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

// ================= UPLOAD API =================
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    // ✅ safety check
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);

    let text = data.text.toLowerCase();

    // ================= SKILLS =================
    const skillsList = [
      "react","node","mongodb","javascript","python","java",
      "html","css","sql","electrician","express","bootstrap",
      "tailwind","figma","git","github","api","firebase",
    ];

    const skills = skillsList.filter((skill) => text.includes(skill));

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

    if (text.includes("linkedin") || text.includes("@")) score += 5;
    if (text.includes("%") || text.includes("improved")) score += 5;
    if (text.length > 500) score += 8;

    if (score > 80) score = 80;

    // ================= SUGGESTIONS =================
    const suggestions = [];

    if (!sections.summary) {
      suggestions.push("Add a strong professional summary at the top.");
    }

    if (!sections.education) {
      suggestions.push("Include Education section.");
    }

    if (!sections.projects) {
      suggestions.push("Add project details.");
    }

    if (!sections.experience) {
      suggestions.push("Mention experience or internships.");
    }

    if (!sections.certifications) {
      suggestions.push("Add certifications.");
    }

    if (skills.length < 3) {
      suggestions.push("Add more technical skills.");
    }

    if (!text.includes("linkedin")) {
      suggestions.push("Add LinkedIn profile.");
    }

    if (!text.includes("%") && !text.includes("improved")) {
      suggestions.push("Use measurable achievements.");
    }

    if (text.length < 500) {
      suggestions.push("Resume is too short, add more details.");
    }

    if (suggestions.length < 2) {
      suggestions.push("Improve formatting consistency.");
      suggestions.push("Customize resume per job.");
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

    if (text.includes("linkedin") || text.includes("@")) {
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

    res.json({
      score,
      skills,
      suggestions,
      sections,
      goodPoints,
      fileName: req.file.originalname,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error analyzing resume");
  }
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});