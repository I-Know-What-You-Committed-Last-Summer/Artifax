import React, { useState } from 'react';
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
  const [tilts, setTilts] = useState({});


  // Handle mouse movement to create a 3D tilt effect
  const handleMouseMove = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -10;
    const rotateY = (x - centerX) / centerX * 10;
    setTilts(prev => ({
      ...prev,
      [index]: `scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    }));
  };

  const handleMouseLeave = (index) => {
    setTilts(prev => ({
      ...prev,
      [index]: ''
    }));
  };

  return (
    <div className="stats-container">
      {statsData.map((item, index) => (
        <div
          key={index}
          className="info-card"
          onMouseMove={(e) => handleMouseMove(e, index)}
          onMouseLeave={() => handleMouseLeave(index)}
          style={{ transform: tilts[index] || '' }}
        >
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