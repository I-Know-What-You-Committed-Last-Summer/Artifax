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
import CraftPanel from './components/craftPanel/craftPanel';
import BlueprintPanel from './components/blueprintPanel/blueprintPanel';
import { blueprintData } from './components/craftingData';

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

const CraftPage = ({ activeTab, onTabChange }) => {
  const [selectedBlueprintId, setSelectedBlueprintId] = React.useState(blueprintData[0]?.id || '');
  const [amount, setAmount] = React.useState(1);
  const [filter, setFilter] = React.useState('all');

  const selectedBlueprint = blueprintData.find((item) => item.id === selectedBlueprintId) || blueprintData[0];

  React.useEffect(() => {
    setAmount(1);
  }, [selectedBlueprintId]);

  const handleCraft = () => {
    if (!selectedBlueprint) return;
    console.log(`Crafting ${amount} ${selectedBlueprint.name}(s)`);
  };

  return (
    <div className="crafting-panel">
      <HistoryStats />
      <CraftingNav activeTab={activeTab} onTabChange={onTabChange} />
      <h2>Craft</h2>
      <div className="active-jobs-layout">
        <div className="active-jobs-main">
          <CraftPanel
            blueprint={selectedBlueprint}
            amount={amount}
            onAmountChange={setAmount}
            onCraft={handleCraft}
          />
        </div>
        <div className="active-jobs-sidebar">
          <BlueprintPanel
            blueprints={blueprintData}
            selectedBlueprintId={selectedBlueprintId}
            filter={filter}
            onFilterChange={setFilter}
            onSelectBlueprint={setSelectedBlueprintId}
          />
          <CraftingQueue />
        </div>
      </div>
    </div>
  );
};

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
        {activeTab === 'craft' && <CraftPage activeTab={activeTab} onTabChange={setActiveTab} />}
        {activeTab === 'active' && <CraftingNav activeTab={activeTab} onTabChange={setActiveTab} />}
        {activeTab === 'active' && <ActiveJobsContent />}
      </div>
    </div>
  );
};

export default Crafting;
