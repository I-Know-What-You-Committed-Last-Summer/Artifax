import React from 'react';
import './craftingItems.css';
import { craftingData } from '../craftingData';
import unitIcon from '../../../../accests/images/uniitIcon.png';

const CraftingItems = () => {
  const activeJobs = craftingData.filter(item => item.status !== "Queued");

  return (
    <div className="active-grid">
      {activeJobs.map((job) => (
        <div key={job.id} className="job-card">
          <div className="card-header">
            <div className="job-info-main">
              <div className="job-icon-box">
                <img src={unitIcon} alt={`${job.name} icon`} className="job-icon" />
              </div>
              <div className="job-titles">
                <h3>{job.name}</h3>
                <p>ID: {job.id} · Qty: {job.qty}</p>
              </div>
            </div>
            <span className={`status-badge ${job.status.toLowerCase().replace(' ', '-')}`}>
              {job.status}
            </span>
          </div>

          <div className="progress-section">
            <div className="progress-text">
              <span>{job.progress}% Complete</span>
              <span>{job.timeLeft}</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${job.progress}%` }}></div>
            </div>
          </div>

          <div className="materials-section">
            <p className="section-label">MATERIALS USED</p>
            <div className="material-tags">
              {job.materials.map((m, i) => (
                <span key={i} className="material-tag">{m}</span>
              ))}
            </div>
          </div>

          <div className="card-actions">
            <button className="btn-cancel">Cancel</button>
            <button className={`btn-action ${job.status === 'Paused' ? 'resume' : 'pause'}`}>
              {job.status === 'Paused' ? 'Resume' : 'Pause'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CraftingItems;