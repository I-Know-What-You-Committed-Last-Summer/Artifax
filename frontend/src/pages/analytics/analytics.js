import React from 'react';
import '../crafting/crafting.css';
import GraphCard from './components/graph/graph';
import MostCrafted from './components/mostCarfted/mostCarfted';
import StatsGrid from '../crafting/components/stats/stats';
import './analytics.css';

const AnalyticsPage = () => (
  <div className="page-content">
    <div className="crafting-page">
      <div className="crafting-panel analytics-top-panel">
        <StatsGrid />
      </div>

      <div className="active-jobs-layout">
        <div className="active-jobs-main">
          <GraphCard />
        </div>
        <div className="active-jobs-sidebar">
          <MostCrafted />
        </div>
      </div>
    </div>
  </div>
);

export default AnalyticsPage;
