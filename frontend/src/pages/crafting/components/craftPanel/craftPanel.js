import React from 'react';
import './craftPanel.css';

const CraftPanel = ({ blueprint, amount, onAmountChange, onCraft }) => {
  const canCraft = blueprint.materials.every(item => item.have >= item.need * amount);

  const handleDecrement = () => {
    onAmountChange(Math.max(1, amount - 1));
  };

  const handleIncrement = () => {
    onAmountChange(amount + 1);
  };

  return (
    <div className="craft-panel-card">
      <div className="craft-panel-header">
        <h3>Crafting</h3>
      </div>
      <div className="craft-panel-selected">
        <span className="craft-panel-label">SELECT BLUEPRINT</span>
        <h4>{blueprint.name}</h4>
      </div>

      <div className="craft-amount-row">
        <div>
          <p className="section-label">Craft Amount</p>
          <div className="amount-control">
            <button type="button" className="amount-btn" onClick={handleDecrement}>-</button>
            <span>{amount}</span>
            <button type="button" className="amount-btn" onClick={handleIncrement}>+</button>
          </div>
        </div>
        <div className="craft-summary">
          <span className="summary-label">Have</span>
          <strong>{blueprint.have}</strong>
          <span className="summary-caption">Ready to craft</span>
        </div>
      </div>

      <div className="materials-list">
        <div className="materials-title-row">
          <span className="section-label">Required Materials</span>
          <span className="materials-qty">Need / Have</span>
        </div>
        {blueprint.materials.map((material) => {
          const enough = material.have >= material.need * amount;
          return (
            <div key={material.name} className={`material-row ${enough ? '' : 'material-missing'}`}>
              <div>
                <span>{material.name}</span>
                {!enough && <p className="material-note">Insufficient quantity</p>}
              </div>
              <span>{material.need * amount} / {material.have}</span>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className={`craft-action-btn ${canCraft ? '' : 'disabled'}`}
        onClick={onCraft}
        disabled={!canCraft}
      >
        Craft Item
      </button>
      <p className="craft-hint">Button enabled when all materials are available.</p>
    </div>
  );
};

export default CraftPanel;
