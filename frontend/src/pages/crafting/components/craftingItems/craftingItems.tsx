import React, { FC, useEffect, useState } from 'react';
import './craftingItems.css';
import { CraftingJob, getActiveAndQueuedJobs } from '../../../../services/orderApi';
import unitIcon from '../../../../assets/images/uniitIcon.png';

// The tilt state stores a CSS transform string for each card by its id.
// Example: { "job-1": "scale(1.02) rotateX(3deg) rotateY(-2deg)" }
interface TiltsState {
  [key: string]: string;
}

const CraftingItems: FC = () => {
  // `tilts` maps card ids to their current transform styles.
  // `setTilts` updates the map when the mouse moves or leaves a card.
  const [tilts, setTilts] = useState<TiltsState>({});
  const [activeJobs, setActiveJobs] = useState<CraftingJob[]>([]);

  useEffect(() => {
    let mounted = true;

    getActiveAndQueuedJobs()
      .then(({ activeItems }) => {
        if (mounted) {
          setActiveJobs(activeItems);
        }
      })
      .catch((error) => {
        console.error('Failed to load active crafting orders', error);
        if (mounted) {
          setActiveJobs([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, id: string): void => {
    // Get the bounding rectangle of the card being hovered.
    const rect = e.currentTarget.getBoundingClientRect();

    // Calculate the mouse position relative to the card's top-left corner.
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find the card center so the rotation is based on mouse offset from center.
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Convert the relative offset into rotation values.
    // The multipliers control the strength of the tilt effect.
    const rotateX = (y - centerY) / centerY * -1.3;
    const rotateY = (x - centerX) / centerX * 1.3;

    // Update the transform string for this card id.
    // We keep previous tilt state for other cards by spreading `prev`.
    setTilts(prev => ({
      ...prev,
      [id]: `scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    }));
  };

  const handleMouseLeave = (id: string): void => {
    // Reset the transform for the card when the mouse leaves.
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
