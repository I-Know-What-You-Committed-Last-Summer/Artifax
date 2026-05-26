// React hooks and UI components used on the inventory page
import { useMemo, useState } from 'react';
import Button from '../../components/common/Button';
import FilterSelect from '../../components/common/FilterSelect';
import SearchInput from '../../components/common/SearchInput';
import SectionCard from '../../components/common/SectionCard';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Tabs from '../../components/common/Tabs';
import AlertStrip from '../../components/layout/AlertStrip';
import PageHeader from '../../components/layout/PageHeader';
import { inventoryAlerts, inventoryItems, inventoryStats, inventoryTabs } from '../../data/mockInventory';
import { getCurrentDateSAST } from '../../Date/dateUtils';

function InventoryPage() {
  // Local UI state: active tab, search text, filters, sorting
  // `getCurrentDateSAST` provides a short date string used in the header
  const currentDate = getCurrentDateSAST();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [zone, setZone] = useState('ALL');
  const [sortBy, setSortBy] = useState('NAME');

  // Compute filtered + sorted items when dependencies change
  const filteredItems = useMemo(() => {
    const searchLower = search.toLowerCase();

    return inventoryItems
      .filter((item) => {
        // Tab filter: show only items for the selected tab
        if (activeTab !== 'all' && item.tab !== activeTab) {
          return false;
        }

        // Status filter (OK / LOW / ALL)
        if (status !== 'ALL' && item.status !== status) {
          return false;
        }

        // Zone/location filter
        if (zone !== 'ALL' && item.location !== zone) {
          return false;
        }

        // If no search text, include the item
        if (searchLower.length === 0) {
          return true;
        }

        // Search across name, sku, and location
        return (
          item.name.toLowerCase().includes(searchLower) ||
          item.sku.toLowerCase().includes(searchLower) ||
          item.location.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        // Optional sort by quantity or by name
        if (sortBy === 'QTY') {
          return b.quantity - a.quantity;
        }

        return a.name.localeCompare(b.name);
      });
  }, [activeTab, search, sortBy, status, zone]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header with action slot on the right */}
      <PageHeader
        title="Inventory Management"
        subtitle={`Full Inventory · ${currentDate}`}
        rightSlot={<Button>Add Item</Button>}
      />
      {/* Alerts at the top */}
      <AlertStrip label="3 Low Stock Alerts:" items={inventoryAlerts} />

      {/* KPI stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {inventoryStats.map((stat) => (
          <StatCard key={stat.id} label={stat.label} value={stat.value} />
        ))}
      </div>

      {/* Main table section with filters, tabs and results */}
      <SectionCard title="All Inventory Items" subtitle="24 items">
        <div className="space-y-3">
          {/* Search and filter controls */}
          <div className="grid gap-2 lg:grid-cols-[2fr,auto,auto,auto]">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search items, SKU, location..."
            />
            <FilterSelect
              value={status}
              onChange={setStatus}
              options={[
                { label: 'Status: All', value: 'ALL' },
                { label: 'Status: OK', value: 'OK' },
                { label: 'Status: Low', value: 'LOW' },
              ]}
            />
            <FilterSelect
              value={zone}
              onChange={setZone}
              options={[
                { label: 'Zone: All', value: 'ALL' },
                { label: 'Zone: A', value: 'Zone A' },
                { label: 'Zone: B', value: 'Zone B' },
                { label: 'Zone: C', value: 'Zone C' },
                { label: 'Zone: D', value: 'Zone D' },
              ]}
            />
            <FilterSelect
              value={sortBy}
              onChange={setSortBy}
              options={[
                { label: 'Sort: Name', value: 'NAME' },
                { label: 'Sort: Quantity', value: 'QTY' },
              ]}
            />
          </div>

          {/* Tabs for quick filtering */}
          <Tabs tabs={inventoryTabs} activeTab={activeTab} onChange={setActiveTab} />

          {/* Results table */}
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
                      {/* Status badge */}
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-2.5">
                      <Button
                        variant="secondary"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full px-0"
                        aria-label={`Edit ${item.name}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                        <span className="sr-only">Edit</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty state when filters return no results */}
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
