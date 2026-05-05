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

function InventoryPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [zone, setZone] = useState('ALL');
  const [sortBy, setSortBy] = useState('NAME');

  const filteredItems = useMemo(() => {
    const searchLower = search.toLowerCase();

    return inventoryItems
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
      .sort((a, b) => {
        if (sortBy === 'QTY') {
          return b.quantity - a.quantity;
        }

        return a.name.localeCompare(b.name);
      });
  }, [activeTab, search, sortBy, status, zone]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        title="Inventory Management"
        subtitle="Full Inventory · Today, 14 Jun 2025"
        rightSlot={<Button>Add Item</Button>}
      />
      <AlertStrip label="3 Low Stock Alerts:" items={inventoryAlerts} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {inventoryStats.map((stat) => (
          <StatCard key={stat.id} label={stat.label} value={stat.value} />
        ))}
      </div>

      <SectionCard title="All Inventory Items" subtitle="24 items">
        <div className="space-y-3">
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

          <Tabs tabs={inventoryTabs} activeTab={activeTab} onChange={setActiveTab} />

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
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-2.5">
                      <Button variant="secondary" className="px-3 py-1 text-xs">
                        Edit
                      </Button>
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
