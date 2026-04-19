import React from 'react';
import './blueprintPanel.css';
import unitIcon from '../../../../accests/images/uniitIcon.png';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'mechanical', label: 'Mechanical' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'furniture', label: 'Furniture' },
];

const computeCraftable = (materials) => {
  if (!materials || materials.length === 0) return 0;
  return materials.reduce((minValue, material) => {
    const count = Math.floor(material.have / material.need);
    return Math.min(minValue, count);
  }, Infinity) || 0;
};

const BlueprintPanel = ({ blueprints, selectedBlueprintId, filter, onFilterChange, onSelectBlueprint }) => {
  const filteredBlueprints = filter === 'all'
    ? blueprints
    : blueprints.filter((blueprint) => blueprint.category === filter);

  const selectedBlueprint = blueprints.find((item) => item.id === selectedBlueprintId);
  const selectedCanCraft = selectedBlueprint ? computeCraftable(selectedBlueprint.materials) > 0 : false;

  return (
    <div className="blueprint-panel">
      <div className="blueprint-header">
        <div>
          <h3>Blueprints</h3>
        </div>
        <div className="blueprint-filter">
          <label htmlFor="blueprintFilter">Filter Blueprints</label>
          <select id="blueprintFilter" value={filter} onChange={(e) => onFilterChange(e.target.value)}>
            {categories.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="blueprint-list">
        {filteredBlueprints.map((blueprint) => {
          const craftable = computeCraftable(blueprint.materials);
          const isDisabled = craftable === 0;
          const cardClass = `blueprint-card ${selectedBlueprintId === blueprint.id ? 'active' : ''} ${isDisabled ? 'cant-craft' : ''}`;

          return (
            <button
              key={blueprint.id}
              type="button"
              className={cardClass}
              onClick={() => !isDisabled && onSelectBlueprint(blueprint.id)}
              disabled={isDisabled}
            >
              <div className="blueprint-card-main">
                <img src={unitIcon} alt="Blueprint icon" className="blueprint-card-icon" />
                <div>
                  <h4>{blueprint.name}</h4>
                </div>
              </div>
              <div className="blueprint-card-meta">
                <div className="meta-block">
                  <span className="meta-label">Have</span>
                  <strong>{blueprint.have}</strong>
                </div>
                <div className="meta-block">
                  <span className="meta-label">Craft</span>
                  <strong>{craftable}</strong>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="blueprint-actions">
        <button type="button" className="blueprint-new-btn">New Blueprint</button>
      </div>
    </div>
  );
};

export default BlueprintPanel;
