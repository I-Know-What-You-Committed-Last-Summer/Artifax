import React, { FC, useEffect, useState } from 'react';
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
import BlueprintEdit from './components/blueprintEdit/BlueprintEdit';
import { useApi } from '../../hooks';
import { getInventoryOverview } from '../../services/inventoryApi';
import { Blueprint } from './components/craftingData';
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

interface CraftPageProps {
  selectedBlueprintId: string;
  selectedBlueprint: Blueprint | null;
  amount: number;
  orderExpedite: boolean;
  filter: string;
  onFilterChange: (filter: string) => void;
  onSelectBlueprint: (blueprintId: string) => void;
  onAmountChange: (amount: number) => void;
  onToggleExpedite: () => void;
  onCraft: () => Promise<void>;
  onEditBlueprint: () => void;
  onDeleteBlueprint: () => void;
}

const CraftPage: FC<PageProps & CraftPageProps> = ({
  activeTab,
  onTabChange,
  selectedBlueprintId,
  selectedBlueprint,
  amount,
  orderExpedite,
  filter,
  onFilterChange,
  onSelectBlueprint,
  onAmountChange,
  onToggleExpedite,
  onCraft,
  onEditBlueprint,
  onDeleteBlueprint,
}) => {
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
              onFilterChange={onFilterChange}
              onSelectBlueprint={onSelectBlueprint}
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
            orderExpedite={orderExpedite}
            onAmountChange={onAmountChange}
            onToggleExpedite={onToggleExpedite}
            onCraft={onCraft}
            onEdit={onEditBlueprint}
            onDelete={onDeleteBlueprint}
          />
        </div>
        <div className="active-jobs-sidebar">
          <BlueprintPanel
            selectedBlueprintId={selectedBlueprintId}
            filter={filter}
            onFilterChange={onFilterChange}
            onSelectBlueprint={onSelectBlueprint}
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

const BlueprintEditPage: FC<PageProps & { itemId: number | null; onCancel: () => void; onSaved: () => void }> = ({ activeTab, onTabChange, itemId, onCancel, onSaved }) => {
  if (!itemId) return null;

  return (
    <div className="crafting-panel">
      <HistoryStats />
      <CraftingNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        onCreateBlueprint={() => onTabChange('new')}
      />
      <div className="new-blueprint-page">
        <BlueprintEdit itemId={itemId} onCancel={onCancel} onSaved={onSaved} />
      </div>
    </div>
  );
};

const Crafting: FC = () => {
  const [activeTab, setActiveTab] = useState<string>('active');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('');
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [orderExpedite, setOrderExpedite] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('all');
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<string[]>([]);
  const api = useApi();
  const currentDate = getCurrentDateSAST();

  const handleSelectBlueprint = async (blueprintId: string) => {
    setSelectedBlueprintId(blueprintId);
    setAmount(1);
    const itemId = parseInt(blueprintId.replace('bp-', ''));

    try {
      const [itemResponse, ingredientsResponse] = await Promise.all([
        fetch(`http://localhost:5253/api/Item/item/${itemId}`),
        fetch(`http://localhost:5253/api/Item/itemIngredient/item/${itemId}`),
      ]);

      if (itemResponse.ok && ingredientsResponse.ok) {
        const item = await itemResponse.json();
        const ingredients = await ingredientsResponse.json();

        let inventoryMap: Record<string, number> = {};
        try {
          const [itemsResp, branchResp] = await Promise.all([
            fetch('http://localhost:5253/api/Item/item'),
            fetch('http://localhost:5253/api/Item/Branch'),
          ]);

          if (itemsResp.ok && branchResp.ok) {
            const items = await itemsResp.json();
            const branchItems = await branchResp.json();
            const idToName: Record<number, string> = {};
            items.forEach((it: any) => {
              idToName[it.itemID] = it.itemName;
            });
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
          productionTime: item.productionTime,
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

  const handleCraft = async (): Promise<void> => {
    if (!selectedBlueprint || !selectedBlueprintId) return;

    const itemId = parseInt(selectedBlueprintId.replace('bp-', ''), 10);
    if (Number.isNaN(itemId)) {
      console.error('Invalid blueprint item id');
      return;
    }

    try {
      const [branchesResponse, usersResponse] = await Promise.all([
        api.get('/Branch'),
        api.get('/User'),
      ]);

      const branch = branchesResponse.data?.[0];
      const user = usersResponse.data?.[0];
      const branchID = branch?.branchID ?? branch?.BranchID ?? 1;
      const employeeID = user?.employeeId ?? user?.EmployeeID ?? 1;

      await api.post('/Order/create', {
        itemID: itemId,
        quantity: amount,
        branchID,
        employeeID,
        orderExpedite,
      });

      window.dispatchEvent(new CustomEvent('crafting-order-updated'));
      alert('Craft order submitted successfully.');
    } catch (error) {
      console.error('Failed to create craft order', error);
      alert('Unable to place craft order. Please try again.');
    }
  };

  const handleEditBlueprint = (): void => {
    if (!selectedBlueprintId) {
      return;
    }

    const itemId = parseInt(selectedBlueprintId.replace('bp-', ''));
    setEditItemId(itemId);
    setActiveTab('edit');
  };

  const handleDeleteBlueprint = async (): Promise<void> => {
    if (!selectedBlueprintId) {
      return;
    }

    const itemId = parseInt(selectedBlueprintId.replace('bp-', ''));
    const confirmed = window.confirm('Delete this blueprint and item? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/Item/${itemId}`);
      alert('Blueprint deleted successfully.');
      setSelectedBlueprint(null);
      setSelectedBlueprintId('');
      setAmount(1);
      setActiveTab('active');
    } catch (error) {
      console.error('Error deleting blueprint:', error);
      alert('Unable to delete blueprint. Please try again.');
    }
  };

  useEffect(() => {
    const loadLowStock = async (): Promise<void> => {
      try {
        const overview = await getInventoryOverview();
        setLowStockAlerts(overview.alerts);
      } catch (error) {
        console.error('Failed to load low stock alerts', error);
      }
    };

    void loadLowStock();
  }, []);

  return (
    <div className="page-content">
      <div className="space-y-4 sm:space-y-5">
        <PageHeader
          title="Crafting Management"
          subtitle={`Crafting Dashboard · ${currentDate}`}
        />
        <AlertStrip label={`Low Stock: ${lowStockAlerts.length}`} items={lowStockAlerts} />

        <div className="crafting-page">
          {activeTab === 'active' && <ActiveJobsPage />}
          {activeTab === 'history' && <HistoryPage activeTab={activeTab} onTabChange={setActiveTab} />}
          {activeTab === 'craft' && (
            <CraftPage
              activeTab={activeTab}
              onTabChange={setActiveTab}
              selectedBlueprintId={selectedBlueprintId}
              selectedBlueprint={selectedBlueprint}
              amount={amount}
              orderExpedite={orderExpedite}
              filter={filter}
              onFilterChange={setFilter}
              onSelectBlueprint={handleSelectBlueprint}
              onAmountChange={setAmount}
              onToggleExpedite={() => setOrderExpedite((prev) => !prev)}
              onCraft={handleCraft}
              onEditBlueprint={handleEditBlueprint}
              onDeleteBlueprint={handleDeleteBlueprint}
            />
          )}
          {activeTab === 'new' && (
            <NewBlueprintPage
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onCancel={() => setActiveTab('active')}
            />
          )}
          {activeTab === 'edit' && (
            <BlueprintEditPage
              activeTab={activeTab}
              onTabChange={setActiveTab}
              itemId={editItemId}
              onCancel={() => setActiveTab('craft')}
              onSaved={() => {
                setActiveTab('craft');
                if (selectedBlueprintId) {
                  handleSelectBlueprint(selectedBlueprintId);
                }
              }}
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
