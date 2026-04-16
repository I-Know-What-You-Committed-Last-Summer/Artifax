import React, { useState } from 'react';
import './craftingItems.css';
import { craftingData } from '../craftingData';
import unitIcon from '../../../../accests/images/uniitIcon.png';

const CraftingItems = () => {
  const [tilts, setTilts] = useState({});

  const activeJobs = craftingData.filter(item => item.status !== "Queued");


  // Handle mouse movement to create a 3D tilt effect
  const handleMouseMove = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -1.3;
    const rotateY = (x - centerX) / centerX * 1.3;
    setTilts(prev => ({
      ...prev,
      [id]: `scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    }));
  };

  const handleMouseLeave = (id) => {
    setTilts(prev => ({
      ...prev,
      [id]: ''
    }));
  };

  return (
    <div className="active-grid">
      {activeJobs.map((job) => (
        <div
          key={job.id}
          className="job-card"
          onMouseMove={(e) => handleMouseMove(e, job.id)}
          onMouseLeave={() => handleMouseLeave(job.id)}
          style={{ transform: tilts[job.id] || '' }}
        >
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