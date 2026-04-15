import React from 'react';
import './craftingNav.css';

const navData = [
  { id: 'active', label: 'Active Jobs', badge: 3 },
  { id: 'craft', label: 'Craft', badge: null },
  { id: 'history', label: 'History', badge: null },
];

const CraftingNav = ({ activeTab, onTabChange }) => {

  return (
    <div className="nav-container">
      {/* Tab Group */}
      <div className="tab-group">
        {navData.map((tab) => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {tab.badge !== null && (
              <span className="nav-badge">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Action Button */}
      <button className="new-craft-btn">
        <svg 
          viewBox="0 0 24 24" 
          width="18" 
          height="18" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        New Craft
      </button>
    </div>
  );
};

export default CraftingNav;