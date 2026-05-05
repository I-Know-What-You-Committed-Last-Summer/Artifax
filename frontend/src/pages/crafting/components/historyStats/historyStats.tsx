import React, { FC, ReactNode } from 'react';
import './historyStats.css';
import totalJobsIcon from '../../../../assets/images/TjodsIcon.png';
import cancelledIcon from '../../../../assets/images/cancelledIcon.png';
import completedIcon from '../../../../assets/images/completeIcon.png';
import avgDurationIcon from '../../../../assets/images/durationIcon.png';

interface HistoryStat {
  label: string;
  value: string;
  icon: ReactNode;
}

const historyStatsData: HistoryStat[] = [
  {
    label: "Total Jobs",
    value: "24",
    icon: <img src={totalJobsIcon} alt="Total Jobs" />
  },
  {
    label: "Cancelled",
    value: "3",
    icon: <img src={cancelledIcon} alt="Cancelled" />
  },
  {
    label: "Completed",
    value: "4,821",
    icon: <img src={completedIcon} alt="Completed" />
  },
  {
    label: "Avg Duration",
    value: "6m",
    icon: <img src={avgDurationIcon} alt="Avg Duration" />
  }
];

const HistoryStats: FC = () => {
  return (
    <div className="history-stats-container">
      {historyStatsData.map((stat, index) => (
        <div key={index} className="history-card">
          <div className="history-icon-wrapper">
            {stat.icon}
          </div>
          <div className="history-text-wrapper">
            <span className="history-label">{stat.label}</span>
            <span className="history-value">{stat.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryStats;
