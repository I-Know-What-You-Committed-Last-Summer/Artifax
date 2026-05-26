import React, { FC, useMemo, useState, useEffect } from 'react';
import './historyPanel.css';
import FilterSelect from '../../../../components/common/FilterSelect';
import { historyData, HistoryItem } from '../historyData';
import unitIcon from '../../../../assets/images/uniitIcon.png';

interface SelectOption {
  label: string;
  value: string;
}

interface StatusCounts {
  [key: string]: number;
  All: number;
  Crafted: number;
  Cancelled: number;
}

const STATUS_TABS: SelectOption[] = [
  { label: 'All', value: 'All' },
  { label: 'Crafted', value: 'Crafted' },
  { label: 'Cancelled', value: 'Cancelled' }
];

const SORT_OPTIONS: SelectOption[] = [
  { label: 'Name', value: 'name' },
  { label: 'Date', value: 'date' },
  { label: 'Qty', value: 'qty' },
  { label: 'Operator', value: 'operator' }
];

const HistoryPanel: FC = () => {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [sortKey, setSortKey] = useState<string>('name');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

  const typeOptions = useMemo(() => [
    'All',
    ...Array.from(new Set(historyData.map((item) => item.type)))
  ], []);

  const statusCounts: StatusCounts = useMemo(() => {
    return historyData.reduce(
      (counts, item) => {
        counts.All += 1;
        if (item.status === 'Crafted') counts.Crafted += 1;
        if (item.status === 'Cancelled') counts.Cancelled += 1;
        return counts;
      },
      { All: 0, Crafted: 0, Cancelled: 0 }
    );
  }, []);

  const filteredData: HistoryItem[] = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return historyData
      .filter((item) => {
        if (activeTab !== 'All' && item.status !== activeTab) return false;
        if (statusFilter !== 'All' && item.status !== statusFilter) return false;
        if (typeFilter !== 'All' && item.type !== typeFilter) return false;

        if (!normalizedSearch) return true;
        return [item.name, item.id, item.operator, item.type, item.location]
          .some((value) => value.toLowerCase().includes(normalizedSearch));
      })
      .sort((a, b) => {
        if (sortKey === 'qty') return b.qty - a.qty;
        if (sortKey === 'date') return a.date.localeCompare(b.date);
        return a[sortKey as keyof HistoryItem].toString().localeCompare(b[sortKey as keyof HistoryItem].toString());
      });
  }, [activeTab, statusFilter, typeFilter, sortKey, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData: HistoryItem[] = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, statusFilter, typeFilter, sortKey, searchQuery]);

  return (
    <section className="history-panel">
      <div className="history-panel-top">
        <div className="history-title-group">
          <div>
            <h2>Crafting History</h2>
            <p className="history-meta">{historyData.length} items</p>
          </div>
        </div>

        <div className="history-controls">
          <div className="history-search">
            <input
              type="text"
              placeholder="Search items, SKU, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="history-filters">
            <div className="history-select-wrapper">
              <label>Status:</label>
              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                ariaLabel="Status filter"
                options={[
                  { label: 'All', value: 'All' },
                  { label: 'Crafted', value: 'Crafted' },
                  { label: 'Cancelled', value: 'Cancelled' },
                ]}
              />
            </div>
            <div className="history-select-wrapper">
              <label>Type:</label>
              <FilterSelect
                value={typeFilter}
                onChange={setTypeFilter}
                ariaLabel="Type filter"
                options={typeOptions.map((type) => ({
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  value: type,
                }))}
              />
            </div>
            <div className="history-select-wrapper">
              <label>Sort:</label>
              <FilterSelect
                value={sortKey}
                onChange={setSortKey}
                ariaLabel="Sort filter"
                options={SORT_OPTIONS}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="history-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`history-tab ${activeTab === tab.value ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label} ({statusCounts[tab.value]})
          </button>
        ))}
      </div>

      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th className="history-arrow-column" />
              <th>ITEM</th>
              <th>DATE</th>
              <th>QTY</th>
              <th>MIN</th>
              <th>OPERATOR</th>
              <th>STATUS</th>
              <th>VIEW</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={`${item.id}-${item.operator}`}>
                <td className="history-arrow-column">
                  <span className="history-row-arrow">›</span>
                </td>
                <td>
                  <div className="history-item-cell">
                    <img src={unitIcon} alt="item icon" className="table-item-icon" />
                    <div>
                      <div className="item-name">{item.name}</div>
                      <div className="item-subtitle">{item.id}</div>
                    </div>
                  </div>
                </td>
                <td>{item.date}</td>
                <td>{item.qty}</td>
                <td>{item.min}</td>
                <td>{item.operator}</td>
                <td>
                  <span className={`status-pill ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <button type="button" className="view-button" aria-label={`View ${item.name}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2.8 12s3.4-6.5 9.2-6.5 9.2 6.5 9.2 6.5-3.4 6.5-9.2 6.5S2.8 12 2.8 12Z" />
                      <circle cx="12" cy="12" r="2.8" />
                    </svg>
                    <span className="sr-only">View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="history-footer">
        <span>Showing {paginatedData.length} of {filteredData.length} items · Rows per page 25</span>
        <div className="history-pagination-controls">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
};

export default HistoryPanel;
