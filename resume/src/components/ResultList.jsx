import React from "react";
import SkillList from "./SkillList";
import "./ResultList.css";

const ResultCard = ({ result }) => {
  return (
    <div className="result-card">
      <h2>Resume Analysis</h2>

      <div className="score">
        <h1>{result.score}%</h1>
        <p>Match Score</p>
      </div>

      <SkillList title="Skills Found" skills={result.skills} type="good" />
      <SkillList title="Missing Skills" skills={result.missing} type="bad" />

      <div className="suggestions">
        <h3>Suggestions</h3>
        <ul>
          {result.suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResultCard;