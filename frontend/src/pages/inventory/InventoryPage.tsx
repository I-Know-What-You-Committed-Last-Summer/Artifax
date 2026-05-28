// React hooks and UI components used on the inventory page
import { useEffect, useMemo, useState } from 'react';
import FilterSelect from '../../components/common/FilterSelect';
import SearchInput from '../../components/common/SearchInput';
import SectionCard from '../../components/common/SectionCard';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Tabs from '../../components/common/Tabs';
import AlertStrip from '../../components/layout/AlertStrip';
import PageHeader from '../../components/layout/PageHeader';
import { buildInventoryOverview, getInventoryItems, getInventoryOverview, InventoryItem, InventoryOverview } from '../../services/inventoryApi';
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

  // keep a local overview state (populated from the server) to avoid recomputing from potentially stale data
  // inventoryOverview is set when `getInventoryOverview()` resolves on mount

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
          <button type="button" className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition hover:border-primary hover:bg-bg">
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

      <SectionCard title="All Inventory Items" subtitle={`${inventoryItems.length} items`}>
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
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-border">
                  <th className="pb-2 font-medium">Material / SKU</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 font-medium">Qty</th>
                  <th className="pb-2 font-medium">Min</th>
                  <th className="pb-2 font-medium">Location</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Edit</th>
                  <th className="pb-2 font-medium">View</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-border/70">
                    <td className="py-2.5">
                      <p className="font-semibold text-text">{item.name}</p>
                      <p className="text-xs text-muted">{item.sku}</p>
                    </td>
                    <td className="py-2.5 text-muted">{item.category}</td>
                    <td className="py-2.5 font-semibold text-text">{item.quantity}</td>
                    <td className="py-2.5 text-muted">{item.minStock}</td>
                    <td className="py-2.5 text-muted">{item.location}</td>
                    <td className="py-2.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-2.5">
                      <button type="button" className="icon-action-button" aria-label={`Edit ${item.name}`}>
                        <img src={editIcon} alt="" aria-hidden="true" className="icon-action-button-icon" />
                        <span className="sr-only">Edit</span>
                      </button>
                    </td>
                    <td className="py-2.5">
                      <button type="button" className="icon-action-button" aria-label={`View ${item.name}`}>
                        <img src={viewIcon} alt="" aria-hidden="true" className="icon-action-button-icon" />
                        <span className="sr-only">View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredItems.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No items match your current filters.</p>
            ) : null}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export default InventoryPage;
