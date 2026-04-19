import React, { useState } from 'react';
import './craftingQueue.css';
import { craftingData } from '../craftingData';
import unitIcon from '../../../../accests/images/uniitIcon.png';

const itemsPerPage = 3;

const CraftingQueue = () => {
  const [page, setPage] = useState(1);
  const activeItems = craftingData.filter((item) => item.status !== 'Queued');
  const queuedItems = craftingData.filter((item) => item.status === 'Queued');
  const activeCount = activeItems.length;
  const totalPages = Math.max(1, Math.ceil(queuedItems.length / itemsPerPage));

  const pageItems = queuedItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handlePrevious = () => setPage((prev) => Math.max(1, prev - 1));
  const handleNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

  return (
    <div className="queue-sidebar">
      <div className="queue-header">
        <div className="queue-title-row">
          <h3>Crafting Queue</h3>
          <span className="queue-count">{activeCount} / 3</span>
        </div>
        <p className="limit-note">Maximum 3 active crafts per location</p>
      </div>

      <div className="queue-section">
        <h4 className="queue-section-title">Active Crafts</h4>
        {activeItems.length === 0 && <p className="empty-state">No active crafts right now.</p>}
        {activeItems.map((item) => (
          <div key={item.id} className="queue-item">
            <div className="queue-item-header">
              <div className="item-info">
                <img src={unitIcon} alt={`${item.name} icon`} className="queue-item-icon" />
                <div>
                  <h4>{item.name} x{item.qty}</h4>
                  <p>{item.status} · {item.location || 'Warehouse A'}</p>
                </div>
              </div>
              <span className={`queue-badge ${item.status.toLowerCase().replace(' ', '-')}`}>
                {item.status}
              </span>
            </div>
            <div className="waiting-status">
              <span>{item.progress}% complete</span>
              <span>{item.timeLeft}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="queue-section">
        <h4 className="queue-section-title">Up Next</h4>
        {pageItems.length === 0 && <p className="empty-state">No queued items ready yet.</p>}
        {pageItems.map((item) => (
          <div key={item.id} className="queue-item">
            <div className="queue-item-header">
              <div className="item-info">
                <img src={unitIcon} alt={`${item.name} icon`} className="queue-item-icon" />
                <div>
                  <h4>{item.name} x{item.qty}</h4>
                  <p>Queued · {item.location || 'Warehouse A'}</p>
                </div>
              </div>
              <span className={`queue-badge ${item.status.toLowerCase().replace(' ', '-')}`}>
                {item.status}
              </span>
            </div>
            <div className="waiting-status">
              <span>Waiting to start</span>
              <span>{item.timeLeft}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="queue-footer">
        <button type="button" onClick={handlePrevious} disabled={page === 1}>Prev</button>
        <span>Page {page} / {totalPages}</span>
        <button type="button" onClick={handleNext} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
};

export default CraftingQueue;