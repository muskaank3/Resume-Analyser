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
      suggestions.push(
        "Add a strong professional summary at the top to quickly highlight your strengths."
      );
    }

    if (!sections.education) {
      suggestions.push(
        "Include a clear Education section with degree, institution, and graduation year."
      );
    }

    if (!sections.projects) {
      suggestions.push(
        "Add project details with technologies used and measurable outcomes."
      );
    }

    if (!sections.experience) {
      suggestions.push(
        "Mention internships, freelance work, or practical experience to strengthen credibility."
      );
    }

    if (!sections.certifications) {
      suggestions.push(
        "Adding certifications can improve recruiter trust and profile strength."
      );
    }

    if (skills.length < 3) {
      suggestions.push(
        "Add more relevant technical skills to better match job requirements."
      );
    }

    if (!text.includes("linkedin")) {
      suggestions.push(
        "Add your LinkedIn profile or portfolio link to improve professional visibility."
      );
    }

    if (!text.includes("%") && !text.includes("improved")) {
      suggestions.push(
        "Use measurable achievements (percentages, impact, results) to make experience stronger."
      );
    }

    if (text.length < 500) {
      suggestions.push(
        "Your resume feels brief. Add more role-specific achievements and responsibilities."
      );
    }

    if (suggestions.length < 2) {
      suggestions.push(
        "Improve formatting consistency by aligning headings, spacing, and section flow."
      );

      suggestions.push(
        "Customize your resume for each job role by matching keywords from the job description."
      );
    }

    // ================= GOOD POINTS =================
    const goodPoints = [];

    if (text.length > 500) {
      goodPoints.push({
        title: "Detailed Content",
        text: "Your resume contains substantial details that help showcase your profile effectively.",
      });
    }

    if (skills.length >= 2) {
      goodPoints.push({
        title: "Technical Skills",
        text: `You have included ${skills.length} relevant skills, which improves your technical profile.`,
      });
    }

    if (sections.projects) {
      goodPoints.push({
        title: "Project Showcase",
        text: "Your project section reflects practical hands-on experience and problem-solving ability.",
      });
    }

    if (sections.experience) {
      goodPoints.push({
        title: "Experience Highlight",
        text: "Your work or internship experience adds credibility to your resume.",
      });
    }

    if (sections.education) {
      goodPoints.push({
        title: "Education Section",
        text: "Your educational background is clearly presented for recruiters.",
      });
    }

    if (text.includes("linkedin") || text.includes("@")) {
      goodPoints.push({
        title: "Professional Presence",
        text: "Your contact details and online presence are well included.",
      });
    }

    if (goodPoints.length === 0) {
      goodPoints.push(
        {
          title: "Resume Structure",
          text: "Your resume has a readable structure that is easy to follow.",
        },
        {
          title: "Essential Details",
          text: "Basic professional information is included for recruiters.",
        }
      );
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
    res.status(500).send("Error");
  }
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});