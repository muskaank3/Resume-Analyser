import React, { useRef } from "react";
import "./Result.css";
import loc from "../assets/Location/location.webp";

const Result = ({ data }) => {
  const scrollRef = useRef(null);

  if (!data) return null;

  const score = data.score || 0;

  const getResumeLevel = () => {
    if (score < 30) return "low";
    if (score < 60) return "medium";
    if (score < 80) return "high";
    return "excellent";
  };

  const level = getResumeLevel();

  return (
    <div className="result-wrapper">
      {/* TOP SECTION */}
      <div className="result-top">
        <p className="small-title">Resume analyser</p>

        <h2>
          {score >= 70
            ? "Well done! Your resume quality is high."
            : score >= 60
            ? "Good! Your resume quality is medium."
            : "Your resume needs improvement."}
        </h2>

        <p className="sub-text">
          A few tweaks can take it to the next level.
        </p>
      </div>

      {/* SCORE CARD */}
      <div className="score-card">
        <div className="line-bar">
          <img
            src={loc}
            alt="score marker"
            className={`score-location ${level}`}
            style={{ left: `${score}%` }}
          />
        </div>

        <div className="labels">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
          <span>Excellent</span>
        </div>

        <p className="score-note">
          Your resume scored <strong>{score}%</strong>
        </p>
      </div>

      {/* FILE INFO */}
      <div className="file-info">
        <p className="resume-head">
          Analysed resume:{" "}
          <span className="resume-namee">
            {data.fileName || "Resume.pdf"}
          </span>
        </p>

        <button
          onClick={() => window.location.reload()}
          className="analyse-btn-link"
        >
          Analyse another resume
        </button>
      </div>

      {/* GOOD POINTS */}
      <div className="feedback-section">
        <div className="feedback-header">
          <h3>What you did well</h3>
        </div>

        <div className="scroll-cards" ref={scrollRef}>
          {data.goodPoints && data.goodPoints.length > 0 ? (
            data.goodPoints.map((item, index) => (
              <div key={index} className="feedback-card success">
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            ))
          ) : (
            <div className="feedback-card success">
              <h4>Resume Structure</h4>
              <p>Your resume has a clean and professional structure.</p>
            </div>
          )}
        </div>
      </div>

      {/* IMPROVEMENTS */}
      <div className="feedback-section">
        <h3>What you can improve</h3>

        <div className="card-grid">
          {data.suggestions && data.suggestions.length > 0 ? (
            data.suggestions.map((item, index) => (
              <div key={index} className="feedback-card warning">
                <h4>Suggestion</h4>
                <p>{item}</p>
              </div>
            ))
          ) : (
            <div className="feedback-card warning">
              <h4>Improvement Tip</h4>
              <p>
                Keep updating your resume regularly with recent projects,
                achievements, and role-specific keywords.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Result;