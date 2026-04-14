import React, { useState } from 'react';
import './crafting.css';
import CraftingNav from './components/craftingNav/craftingNav';
import StatsGrid from './components/stats/stats';
import CraftingItems from './components/craftingItems/craftingItems';
import CraftingQueue from './components/craftingQueue/craftingQueue';

const ActiveJobsPage = () => (
  <div className="crafting-panel">
    <StatsGrid />
  </div>
);

const ActiveJobsContent = () => (
  <div className="crafting-panel">
    <div className="active-jobs-layout">
      <div className="active-jobs-main">
        <CraftingItems />
      </div>
      <div className="active-jobs-sidebar">
        <CraftingQueue />
      </div>
    </div>
  </div>
);

const CraftPage = () => (
  <div className="crafting-panel">
    <h2>Craft</h2>
    <p>Use this space for crafting actions and workflows.</p>
  </div>
);

const HistoryPage = () => (
  <div className="crafting-panel">
    <h2>History</h2>
    <p>Recent crafting activity and completed jobs will appear here.</p>
  </div>
);

const Crafting = () => {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="page-content">
      <div className="crafting-page">
        {activeTab === 'active' && <ActiveJobsPage />}
        <CraftingNav activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'active' && <ActiveJobsContent />}
        {activeTab === 'craft' && <CraftPage />}
        {activeTab === 'history' && <HistoryPage />}
      </div>
    </div>
  );
};

export default Crafting;
