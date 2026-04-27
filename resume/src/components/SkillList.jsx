import React from "react";
import "./SkillList.css";

const SkillList = ({ title, skills, type }) => {
  return (
    <div className="skill-list">
      <h3>{title}</h3>
      <div>
        {skills.map((skill, i) => (
          <span key={i} className={type}>
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkillList;

