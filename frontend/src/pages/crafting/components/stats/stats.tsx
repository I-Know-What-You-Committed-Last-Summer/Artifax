import React, { FC, useState, ReactNode } from 'react';
import './stats.css';
import recipesIcon from '../../../../assets/images/recipesIcon.png';
import activeJodIcon from '../../../../assets/images/activeJodIcon.png';
import completedIcon from '../../../../assets/images/completeIcon.png';
import blockedIcon from '../../../../assets/images/blockedIcon.png';

interface StatItem {
  label: string;
  value: number;
  icon: ReactNode;
}

interface TiltsState {
  [key: number]: string;
}

const statsData: StatItem[] = [
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

const StatsGrid: FC = () => {
  const [tilts, setTilts] = useState<TiltsState>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number): void => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -2;
    const rotateY = (x - centerX) / centerX * 2;
    setTilts(prev => ({
      ...prev,
      [index]: `scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    }));
  };

  const handleMouseLeave = (index: number): void => {
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
