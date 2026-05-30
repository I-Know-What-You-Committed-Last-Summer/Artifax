// React hooks and UI components used on the inventory page
import React, { useEffect, useMemo, useState } from 'react';
import FilterSelect from '../../components/common/FilterSelect';
import SearchInput from '../../components/common/SearchInput';
import SectionCard from '../../components/common/SectionCard';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Tabs from '../../components/common/Tabs';
import AlertStrip from '../../components/layout/AlertStrip';
import PageHeader from '../../components/layout/PageHeader';
import InventoryMaterialsPopover from './components/InventoryMaterialsPopover';
import InventoryItemEditModal from './components/InventoryItemEditModal';
import InventoryItemCreateModal from './components/InventoryItemCreateModal';
import InventoryItemIngredientModal from './components/InventoryItemIngredientModal';
import { createInventoryItem, getInventoryOverview, getItemMaterialDetails, updateInventoryItem, InventoryCreatedItem, InventoryItem, InventoryMaterialDetails, InventoryOverview, InventoryItemCreate, InventoryItemUpdate } from '../../services/inventoryApi';
import { getCurrentDateSAST } from '../../Date/dateUtils';
import editIcon from '../../assets/images/Edit Icon.png';
import viewIcon from '../../assets/images/View Icon.png';

function InventoryPage() {
  const currentDate = getCurrentDateSAST();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [zone, setZone] = useState('ALL');
  const [sortBy, setSortBy] = useState('NAME');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryOverview, setInventoryOverview] = useState<InventoryOverview>({ items: [], previewRows: [], alerts: [], stats: [], tabs: [] });
  const [expandedViewItemId, setExpandedViewItemId] = useState<number | null>(null);
  const [materialDetailsById, setMaterialDetailsById] = useState<Record<number, InventoryMaterialDetails | null>>({});
  const [loadingMaterialItemId, setLoadingMaterialItemId] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [savingEditItemId, setSavingEditItemId] = useState<number | null>(null);
  const [creatingItem, setCreatingItem] = useState(false);
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [ingredientItem, setIngredientItem] = useState<InventoryCreatedItem | null>(null);

  useEffect(() => {
    let mounted = true;

    // Prefer fetching the overview (aggregated items + stats) so UI stays consistent
    getInventoryOverview()
      .then((overview) => {
        if (mounted) {
          setInventoryItems(overview.items);
          setInventoryOverview(overview);
        }
      })
      .catch((error) => {
        console.error('Failed to load inventory items', error);
        if (mounted) setInventoryItems([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpandedViewItemId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const closeExpandedView = (): void => {
    setExpandedViewItemId(null);
  };

  const closeEditModal = (): void => {
    setEditingItemId(null);
  };

  const openCreateModal = (): void => {
    setCreateItemOpen(true);
  };

  const closeCreateModal = (): void => {
    setCreateItemOpen(false);
  };

  const closeIngredientModal = (): void => {
    setIngredientItem(null);
  };

  const handleViewClick = async (item: InventoryItem): Promise<void> => {
    const numericItemId = Number(item.id);

    if (expandedViewItemId === numericItemId) {
      closeExpandedView();
      return;
    }

    setExpandedViewItemId(numericItemId);

    if (Number.isNaN(numericItemId) || materialDetailsById[numericItemId] !== undefined) {
      return;
    }

    setLoadingMaterialItemId(numericItemId);

    try {
      const details = await getItemMaterialDetails(numericItemId);
      setMaterialDetailsById((current) => ({ ...current, [numericItemId]: details }));
    } catch (error) {
      console.error(`Failed to load materials for item ${numericItemId}`, error);
      setMaterialDetailsById((current) => ({ ...current, [numericItemId]: null }));
    } finally {
      setLoadingMaterialItemId((current) => (current === numericItemId ? null : current));
    }
  };

  const handleEditClick = (item: InventoryItem): void => {
    closeExpandedView();
    setEditingItemId(Number(item.id));
  };

  const handleSaveEdit = async (itemId: number, payload: InventoryItemUpdate): Promise<void> => {
    setSavingEditItemId(itemId);

    try {
      await updateInventoryItem(itemId, payload);
      const overview = await getInventoryOverview();
      setInventoryItems(overview.items);
      setInventoryOverview(overview);
      setEditingItemId(null);
    } catch (error) {
      console.error(`Failed to save item ${itemId}`, error);
      throw error;
    } finally {
      setSavingEditItemId((current) => (current === itemId ? null : current));
    }
  };

  const handleCreateItem = async (payload: InventoryItemCreate): Promise<InventoryCreatedItem> => {
    setCreatingItem(true);

    try {
      const createdItem = await createInventoryItem(payload);
      const overview = await getInventoryOverview();
      setInventoryItems(overview.items);
      setInventoryOverview(overview);
      setCreateItemOpen(false);
      setIngredientItem(createdItem);
      return createdItem;
    } catch (error) {
      console.error('Failed to create inventory item', error);
      throw error;
    } finally {
      setCreatingItem(false);
    }
  };

  // prefer server-provided overview items, fall back to per-item list
  const sourceItems = inventoryOverview.items && inventoryOverview.items.length ? inventoryOverview.items : inventoryItems;
  const locationOptions = useMemo(() => {
    const locations = Array.from(new Set(sourceItems.map((item) => item.location))).sort((left, right) => left.localeCompare(right));

    return [
      { label: 'Location: All', value: 'ALL' },
      ...locations.map((location) => ({ label: `Location: ${location}`, value: location })),
    ];
  }, [sourceItems]);

  const filteredItems = useMemo(() => {
    const searchLower = search.toLowerCase();

    return sourceItems
      .filter((item) => {
        if (activeTab !== 'all' && item.tab !== activeTab) {
          return false;
        }

        if (status !== 'ALL' && item.status !== status) {
          return false;
        }

        if (zone !== 'ALL' && item.location !== zone) {
          return false;
        }

        if (searchLower.length === 0) {
          return true;
        }

        return (
          item.name.toLowerCase().includes(searchLower) ||
          item.sku.toLowerCase().includes(searchLower) ||
          item.location.toLowerCase().includes(searchLower)
        );
      })
      .sort((left, right) => {
        if (sortBy === 'QTY') {
          return right.quantity - left.quantity;
        }

        return left.name.localeCompare(right.name);
      });
  }, [activeTab, sourceItems, search, sortBy, status, zone]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        title="Inventory Management"
        subtitle={`Full Inventory · ${currentDate}`}
        rightSlot={
          <button type="button" className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition hover:border-primary hover:bg-bg" onClick={openCreateModal}>
            Add Item
          </button>
        }
      />

      <AlertStrip label={`Low Stock: ${inventoryOverview.alerts.length}`} items={inventoryOverview.alerts} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {inventoryOverview.stats.map((stat) => (
          <StatCard key={stat.id} label={stat.label} value={stat.value} />
        ))}
      </div>

      <SectionCard title="All Inventory Items" subtitle={`${sourceItems.length} items`}>
        <div className="space-y-3">
          <div className="grid items-end gap-2 lg:grid-cols-[minmax(0,2.4fr),repeat(3,minmax(0,1fr))]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search items, SKU, location..." />
            <FilterSelect
              value={status}
              onChange={setStatus}
              options={[
                { label: 'Status: All', value: 'ALL' },
                { label: 'Status: OK', value: 'OK' },
                { label: 'Status: Low', value: 'LOW' },
              ]}
            />
            <FilterSelect value={zone} onChange={setZone} options={locationOptions} />
            <FilterSelect
              value={sortBy}
              onChange={setSortBy}
              options={[
                { label: 'Sort: Name', value: 'NAME' },
                { label: 'Sort: Quantity', value: 'QTY' },
              ]}
            />
          </div>

          <Tabs tabs={inventoryOverview.tabs} activeTab={activeTab} onChange={setActiveTab} />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-border">
                  <th className="pb-2 font-medium">Material / SKU</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 text-right font-medium">Qty</th>
                  <th className="pb-2 font-medium">Min</th>
                  <th className="pb-2 font-medium">Location</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Edit</th>
                  <th className="pb-2 font-medium">View</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const itemId = Number(item.id);
                  const isExpanded = expandedViewItemId === itemId;

                  return (
                    <React.Fragment key={item.id}>
                      <tr className={`border-b border-border/70 ${isExpanded ? 'bg-bg/30' : ''}`}>
                        <td className="py-2.5 pr-3">
                          <p className="font-semibold text-text">{item.name}</p>
                          <p className="text-xs text-muted">{item.sku}</p>
                        </td>
                        <td className="py-2.5 pr-3 text-muted">{item.category}</td>
                        <td className="py-2.5 pr-3 text-right font-semibold text-text">{item.quantity}</td>
                        <td className="py-2.5 pr-3 text-muted">{item.minStock}</td>
                        <td className="inventory-location-cell py-2.5 pr-3 text-muted">{item.location}</td>
                        <td className="py-2.5 pr-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-2.5 pr-3">
                          <button
                            type="button"
                            className="icon-action-button"
                            aria-label={`Edit ${item.name}`}
                            onClick={() => handleEditClick(item)}
                          >
                            <img src={editIcon} alt="" aria-hidden="true" className="icon-action-button-icon" />
                            <span className="sr-only">Edit</span>
                          </button>
                        </td>
                        <td className="py-2.5">
                          <button
                            type="button"
                            className={`icon-action-button ${isExpanded ? 'border-primary bg-bg text-text' : ''}`}
                            aria-label={`View ${item.name}`}
                            aria-controls={`inventory-details-${item.id}`}
                            aria-expanded={isExpanded}
                            onClick={() => {
                              void handleViewClick(item);
                            }}
                          >
                            <img src={viewIcon} alt="" aria-hidden="true" className="icon-action-button-icon" />
                            <span className="sr-only">View</span>
                          </button>
                        </td>
                      </tr>

                      {isExpanded ? (
                        <tr className="border-b border-border/70 bg-app/60">
                          <td colSpan={8} className="px-0 py-3">
                            <div id={`inventory-details-${item.id}`} className="inventory-view-details px-0 sm:px-1">
                              <InventoryMaterialsPopover
                              loading={loadingMaterialItemId === itemId && materialDetailsById[itemId] === undefined}
                              details={materialDetailsById[itemId] ?? null}
                              compact
                              />
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {filteredItems.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No items match your current filters.</p>
            ) : null}
          </div>
          <InventoryItemEditModal
            item={editingItemId != null ? sourceItems.find((candidate) => Number(candidate.id) === editingItemId) ?? null : null}
            open={editingItemId != null}
            saving={savingEditItemId === editingItemId}
            onClose={closeEditModal}
            onSave={handleSaveEdit}
          />

          <InventoryItemCreateModal
            open={createItemOpen}
            saving={creatingItem}
            onClose={closeCreateModal}
            onCreate={handleCreateItem}
          />

          <InventoryItemIngredientModal
            item={ingredientItem}
            open={ingredientItem != null}
            onClose={closeIngredientModal}
          />
        </div>
      </SectionCard>
    </div>
  );
}

export default InventoryPage;
