import React, { useState } from 'react';
import './crafting.css';
import AlertStrip from '../../components/layout/AlertStrip';
import PageHeader from '../../components/layout/PageHeader';
import CraftingNav from './components/craftingNav/craftingNav';
import StatsGrid from './components/stats/stats';
import HistoryStats from './components/historyStats/historyStats';
import HistoryPanel from './components/historyPanel/historyPanel';
import CraftingItems from './components/craftingItems/craftingItems';
import CraftingQueue from './components/craftingQueue/craftingQueue';

const craftingAlerts = ['Steel Rods (4 remaining)', 'Copper Wire (2 remaining)'];

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
    <HistoryStats />
    <h2>Craft</h2>
    <p>Use this space for crafting actions and workflows.</p>
  </div>
);

const HistoryPage = ({ activeTab, onTabChange }) => (
  <div className="crafting-panel">
    <HistoryStats />
    <CraftingNav activeTab={activeTab} onTabChange={onTabChange} />
    <HistoryPanel />
  </div>
);



const Crafting = () => {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="page-content">
      <div className="crafting-page">
        {activeTab === 'active' && <ActiveJobsPage />}
        {activeTab === 'history' && <HistoryPage activeTab={activeTab} onTabChange={setActiveTab} />}
        {activeTab !== 'history' && <CraftingNav activeTab={activeTab} onTabChange={setActiveTab} />}
        {activeTab === 'active' && <ActiveJobsContent />}
        {activeTab === 'craft' && <CraftPage />}
      </div>
    </div>
  );
};

export default Crafting;
