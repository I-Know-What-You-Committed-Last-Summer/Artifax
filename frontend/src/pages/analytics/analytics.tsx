import React from 'react';
import '../crafting/crafting.css';
import AlertStrip from '../../components/layout/AlertStrip';
import PageHeader from '../../components/layout/PageHeader';
import GraphCard from './components/graph/graph';
import MostCrafted from './components/mostCarfted/mostCarfted';
import StatsGrid from '../crafting/components/stats/stats';
import './analytics.css';
import { analyticsAlerts } from '../../data/mockDashboard';
import { getCurrentDateSAST } from '../../Date/dateUtils';

const AnalyticsPage: React.FC = () => {
  const currentDate = getCurrentDateSAST();

  return (
    <div className="page-content">
      <div className="space-y-4 sm:space-y-5">
        <PageHeader
          title="Analytics"
          subtitle={`Crafting Analytics · ${currentDate}`}
        />
        <AlertStrip label="Trending:" items={analyticsAlerts} />

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
    </div>
  );
};

export default AnalyticsPage;
