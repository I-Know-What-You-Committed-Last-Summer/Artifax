import React from 'react';
import './stats.css';
import recipesIcon from '../../../../accests/images/recipesIcon.png';
import activeJodIcon from '../../../../accests/images/activeJodIcon.png';
import completedIcon from '../../../../accests/images/completeIcon.png';
import blockedIcon from '../../../../accests/images/blockedIcon.png';

const statsData = [
  {
    label: "Recipes",
    value: 8,
    icon: <img src={recipesIcon} alt="Recipes" />
  },
  {
    label: "Active Jobs",
    value: 3,
    icon: <img src={activeJodIcon} alt="Active Jobs" />
  },
  {
    label: "Completed",
    value: 41,
    icon: <img src={completedIcon} alt="Completed" />
  },
  {
    label: "Blocked",
    value: 2,
    icon: <img src={blockedIcon} alt="Blocked" />
  }
];

const StatsGrid = () => {
  return (
    <div className="stats-container">
      {statsData.map((item, index) => (
        <div key={index} className="info-card">
          <div className="icon-wrapper">
            {item.icon}
          </div>
          <div className="text-wrapper">
            <span className="stat-label">{item.label}</span>
            <span className="stat-value">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;