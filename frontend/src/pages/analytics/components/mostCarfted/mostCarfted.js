import React, { useMemo, useState } from 'react';
import './mostCarfted.css';
import { blueprintData } from '../../../../pages/crafting/components/craftingData';
import unitIcon from '../../../../accests/images/uniitIcon.png';

const sortOptions = [
  { value: 'high', label: 'High to low' },
  { value: 'low', label: 'Low to high' }
];

const MostCrafted = () => {
  const [sortOrder, setSortOrder] = useState('high');

  const sortedBlueprints = useMemo(() => {
    return [...blueprintData].sort((a, b) => {
      if (sortOrder === 'low') return a.craft - b.craft;
      return b.craft - a.craft;
    });
  }, [sortOrder]);

  return (
    <section className="blueprint-panel most-crafted-card">
      <div className="blueprint-header">
        <div>
          <h3>Most Crafted Blueprints</h3>
        </div>
        <div className="blueprint-filter">
          <label htmlFor="mostCraftedSort">Filter Blueprints</label>
          <select
            id="mostCraftedSort"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="blueprint-list most-crafted-list">
        {sortedBlueprints.map((blueprint) => (
          <button
            key={blueprint.id}
            type="button"
            className="blueprint-card"
          >
            <div className="blueprint-card-main">
              <img src={unitIcon} alt="Blueprint icon" className="blueprint-card-icon" />
              <div>
                <h4>{blueprint.name}</h4>
              </div>
            </div>
            <div className="blueprint-card-meta">
              <div className="meta-block">
                <span className="meta-label">Crafted</span>
                <strong>{blueprint.craft}</strong>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default MostCrafted;
