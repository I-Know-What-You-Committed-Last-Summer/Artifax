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
import { inventoryAlerts, inventoryItems, inventoryStats, inventoryTabs } from '../../data/mockInventory';
import { getCurrentDateSAST } from '../../Date/dateUtils';
import editIcon from '../../assets/images/Edit Icon.png';
import viewIcon from '../../assets/images/View Icon.png';
import axios from 'axios';

function InventoryPage() {
  // Local UI state: active tab, search text, filters, sorting
  // `getCurrentDateSAST` provides a short date string used in the header
  const currentDate = getCurrentDateSAST();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [zone, setZone] = useState('ALL');
  const [sortBy, setSortBy] = useState('NAME');
  const [inventoryData, setInventoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  


useEffect(() => {
    
    const fetchInventory = async () => {
      try {
        
        const response = await axios.get('http://localhost:5253/api/Item/item/allInventoryItems');
        console.log('Fetched inventory data:', response.data);
        setInventoryData(response.data);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      } finally {
        setIsLoading(false); 
      }
    };

    
    fetchInventory();
  }, []);



//   inventoryItemBranchName
// : 
// "Johannesburg"
// inventoryItemCategory
// : 
// "Metals"
// inventoryItemId
// : 
// 1
// inventoryItemName
// : 
// "Stainless Steel"
// inventoryItemProductionTime
// : 
// 5
// inventoryItemQuantity
// : 
// 5
  // Compute filtered + sorted items when dependencies change
  const filteredItems = useMemo(() => {
    const searchLower = search.toLowerCase();

    return inventoryData
      .filter((item) => {
        // Tab filter: show only items for the selected tab
        if (activeTab !== 'all' && item.inventoryItemCategory !== activeTab) {
          return false;
        }
        // Status filter (OK / LOW / ALL)
        if (status !== 'ALL' && item.status !== status) {
          //FIXME: Bypassing, pls fix
          return true;
        }

        // Zone/location filter
        if (zone !== 'ALL' && item.inventoryItemBranchName !== zone) {
          return true;
        }

        // If no search text, include the item
        if (searchLower.length === 0) {
          return true;
        }

        // Search across name, sku, and location
        return (
          item.inventoryItemName.toLowerCase().includes(searchLower) ||
          item.inventoryItemSKU.toLowerCase().includes(searchLower) ||
          item.inventoryItemBranchName.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        // Optional sort by quantity or by name
        if (sortBy === 'QTY') {
          return b.inventoryItemQuantity - a.inventoryItemQuantity;
        }

        return a.inventoryItemName.localeCompare(b.inventoryItemName);
      });
  }, [activeTab, search, sortBy, status, zone]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header with action slot on the right */}
      <PageHeader
        title="Inventory Management"
        subtitle={`Full Inventory · ${currentDate}`}
        rightSlot={
          <button type="button" className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition hover:border-primary hover:bg-bg">
            Add Item
          </button>
        }
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
          <div className="grid items-end gap-2 lg:grid-cols-[minmax(0,2.4fr),repeat(3,minmax(0,1fr))]">
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
                  <th className="pb-2 font-medium">View</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.inventoryItemId} className="border-b border-border/70">
                    <td className="py-2.5">
                      <p className="font-semibold text-text">{item.inventoryItemName}</p>
                      <p className="text-xs text-muted">{item.inventoryItemCategory.slice(0, 3) + "-" + item.inventoryItemId}</p>
                    </td>
                    <td className="py-2.5 text-muted">{item.inventoryItemCategory}</td>
                    <td className="py-2.5 font-semibold text-text">{item.inventoryItemQuantity}</td>
                    <td className="py-2.5 text-muted">{item.inventoryItemProductionTime}</td>
                    <td className="py-2.5 text-muted">{item.inventoryItemBranchName}</td>
                    <td className="py-2.5">
                      {/* Status badge */}
                      <StatusBadge status={item.inventoryItemQuantity < 10 ? 'LOW' : 'OK'} />
                    </td>
                    <td className="py-2.5">
                      <button
                        type="button"
                        className="icon-action-button"
                        aria-label={`Edit ${item.inventoryItemId}`}
                      >
                        <img src={editIcon} alt="" aria-hidden="true" className="icon-action-button-icon" />
                        <span className="sr-only">Edit</span>
                      </button>
                    </td>
                    <td className="py-2.5">
                      <button
                        type="button"
                        className="icon-action-button"
                        aria-label={`View ${item.name}`}
                      >
                        <img src={viewIcon} alt="" aria-hidden="true" className="icon-action-button-icon" />
                        <span className="sr-only">View</span>
                      </button>
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
