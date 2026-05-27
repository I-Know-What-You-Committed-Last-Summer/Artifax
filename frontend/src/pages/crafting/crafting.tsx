import React, { FC, useState } from 'react';
import './crafting.css';
import AlertStrip from '../../components/layout/AlertStrip';
import PageHeader from '../../components/layout/PageHeader';
import CraftingNav from './components/craftingNav/craftingNav';
import StatsGrid from './components/stats/stats';
import HistoryStats from './components/historyStats/historyStats';
import HistoryPanel from './components/historyPanel/historyPanel';
import CraftingItems from './components/craftingItems/craftingItems';
import CraftingQueue from './components/craftingQueue/craftingQueue';
import CraftPanel from './components/craftPanel/craftPanel';
import BlueprintPanel from './components/blueprintPanel/blueprintPanel';
import NewBlueprint from './components/newBlueprint/newBlueprint';
import { Blueprint } from './components/craftingData';
import { craftingAlerts } from '../../data/mockDashboard';
import { getCurrentDateSAST } from '../../Date/dateUtils';

interface PageProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const ActiveJobsPage: FC = () => (
  <div className="crafting-panel">
    <StatsGrid />
  </div>
);

const ActiveJobsContent: FC = () => (
  <div className="crafting-panel">
    <div className="active-jobs-layout">
      <div className="active-jobs-main">
        <CraftingItems />
      </div>
      <div className="active-jobs-sidebar">
        <CraftingQueue />
      </div>
    </div>
  </div>
);

const CraftPage: FC<PageProps> = ({ activeTab, onTabChange }) => {
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('');
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [filter, setFilter] = useState<string>('all');

  /**
   * Handle blueprint selection from BlueprintPanel
   * This is called when user clicks on a blueprint card
   */
  const handleSelectBlueprint = async (blueprintId: string) => {
    setSelectedBlueprintId(blueprintId);
    setAmount(1);
    
    // Extract the itemID from the selected blueprint card ID.
    // The blueprint IDs are stored as bp-{itemID}.
    const itemId = parseInt(blueprintId.replace('bp-', ''));
    
    // Fetch the selected item details and its ingredient list.
    // This is used to populate the craft panel with the full blueprint data.
    try {
      const itemResponse = await fetch(`http://localhost:5253/api/Item/item/${itemId}`);
      const ingredientsResponse = await fetch(
        `http://localhost:5253/api/Item/itemIngredient/item/${itemId}`
      );

      if (itemResponse.ok && ingredientsResponse.ok) {
        const item = await itemResponse.json();
        const ingredients = await ingredientsResponse.json();

        // Fetch inventory to populate `have` values for materials and blueprint
        let inventoryMap: Record<string, number> = {};
        try {
          const [itemsResp, branchResp] = await Promise.all([
            fetch('http://localhost:5253/api/Item/item'),
            fetch('http://localhost:5253/api/Item/Branch')
          ]);

          if (itemsResp.ok && branchResp.ok) {
            const items = await itemsResp.json();
            const branchItems = await branchResp.json();
            const idToName: Record<number, string> = {};
            items.forEach((it: any) => { idToName[it.itemID] = it.itemName; });
            branchItems.forEach((bic: any) => {
              const name = idToName[bic.itemID];
              if (!name) return;
              inventoryMap[name] = (inventoryMap[name] || 0) + (bic.itemQuantity || 0);
            });
          }
        } catch (e) {
          console.error('Error fetching inventory for blueprint:', e);
        }

        const blueprint: Blueprint = {
          id: `bp-${item.itemID}`,
          name: item.itemName,
          description: `Production time: ${item.productionTime}s`,
          category: item.itemCategory?.toLowerCase() as any || 'mechanical',
          have: inventoryMap[item.itemName] || 0,
          craft: 0,
          materials: ingredients.map((ing: any) => ({
            name: ing.itemName,
            need: ing.quantity,
            have: inventoryMap[ing.itemName] || 0,
          })),
        };

        setSelectedBlueprint(blueprint);
      }
    } catch (err) {
      console.error('Error fetching selected blueprint:', err);
    }
  };

  const handleCraft = (): void => {
    if (!selectedBlueprint) return;
    console.log(`Crafting ${amount} ${selectedBlueprint.name}(s)`);
  };

  // Show empty state if no blueprint is selected
  if (!selectedBlueprint) {
    return (
      <div className="crafting-panel">
        <HistoryStats />
        <CraftingNav
          activeTab={activeTab}
          onTabChange={onTabChange}
          onCreateBlueprint={() => onTabChange('new')}
        />
        <div className="active-jobs-layout">
          <div className="active-jobs-main">
            <div className="craft-panel-card">
              <div className="craft-panel-header">
                <h3>Crafting</h3>
              </div>
              <div className="craft-panel-selected">
                <span className="craft-panel-label">SELECT BLUEPRINT</span>
                <h4>No Blueprint Selected</h4>
                <p style={{ color: 'var(--muted)', marginTop: '8px' }}>
                  Select a blueprint from the list to begin crafting
                </p>
              </div>
            </div>
          </div>
          <div className="active-jobs-sidebar">
            <BlueprintPanel
              selectedBlueprintId={selectedBlueprintId}
              filter={filter}
              onFilterChange={setFilter}
              onSelectBlueprint={handleSelectBlueprint}
              onCreateBlueprint={() => onTabChange('new')}
            />
            <CraftingQueue />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="crafting-panel">
      <HistoryStats />
      <CraftingNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        onCreateBlueprint={() => onTabChange('new')}
      />
      <div className="active-jobs-layout">
        <div className="active-jobs-main">
          <CraftPanel
            blueprint={selectedBlueprint}
            amount={amount}
            onAmountChange={setAmount}
            onCraft={handleCraft}
          />
        </div>
        <div className="active-jobs-sidebar">
          <BlueprintPanel
            selectedBlueprintId={selectedBlueprintId}
            filter={filter}
            onFilterChange={setFilter}
            onSelectBlueprint={handleSelectBlueprint}
            onCreateBlueprint={() => onTabChange('new')}
          />
          <CraftingQueue />
        </div>
      </div>
    </div>
  );
};

const HistoryPage: FC<PageProps> = ({ activeTab, onTabChange }) => (
  <div className="crafting-panel">
    <HistoryStats />
    <CraftingNav
      activeTab={activeTab}
      onTabChange={onTabChange}
      onCreateBlueprint={() => onTabChange('new')}
    />
    <HistoryPanel />
  </div>
);

const NewBlueprintPage: FC<PageProps & { onCancel: () => void }> = ({ activeTab, onTabChange, onCancel }) => (
  <div className="crafting-panel">
    <HistoryStats />
    <CraftingNav
      activeTab={activeTab}
      onTabChange={onTabChange}
      onCreateBlueprint={() => onTabChange('new')}
    />
    <div className="new-blueprint-page">
      <NewBlueprint onCancel={onCancel} />
    </div>
  </div>
);

const Crafting: FC = () => {
  const [activeTab, setActiveTab] = useState<string>('active');
   const currentDate = getCurrentDateSAST();

  return (
    <div className="page-content">
      <div className="space-y-4 sm:space-y-5">
        <PageHeader
          title="Crafting Management"
          subtitle={`Crafting Dashboard · ${currentDate}`}
        />
        <AlertStrip label="Active Jobs:" items={craftingAlerts} />

        <div className="crafting-page">
          {activeTab === 'active' && <ActiveJobsPage />}
          {activeTab === 'history' && <HistoryPage activeTab={activeTab} onTabChange={setActiveTab} />}
          {activeTab === 'craft' && <CraftPage activeTab={activeTab} onTabChange={setActiveTab} />}
          {activeTab === 'new' && (
            <NewBlueprintPage
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onCancel={() => setActiveTab('active')}
            />
          )}
          {activeTab === 'active' && <CraftingNav activeTab={activeTab} onTabChange={setActiveTab} onCreateBlueprint={() => setActiveTab('new')} />}
          {activeTab === 'active' && <ActiveJobsContent />}
        </div>
      </div>
    </div>
  );
};

export default Crafting;
