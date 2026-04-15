import React from 'react';
import './craftingQueue.css';
import { craftingData } from '../craftingData';
import unitIcon from '../../../../accests/images/uniitIcon.png';

const CraftingQueue = () => {
  const activeCount = craftingData.filter(j => j.status === "In Progress").length;
  const queuedItems = craftingData.filter(item => item.status === "Queued");

  return (
    <div className="queue-sidebar">
      <div className="queue-header">
        <div className="queue-title-row">
          <h3>Crafting Queue</h3>
          <span className="queue-count">{activeCount} / 3</span>
        </div>
        <p className="limit-note">Maximum 3 active crafts per location</p>
      </div>

      <div className="queue-list">
        {queuedItems.map((item, index) => (
          <div key={index} className="queue-item">
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
    </div>
  );
};

export default CraftingQueue;