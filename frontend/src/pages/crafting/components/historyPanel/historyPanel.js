import React, { useMemo, useState, useEffect } from 'react';
import './historyPanel.css';
import { historyData } from '../historyData';
import unitIcon from '../../../../accests/images/uniitIcon.png';

const STATUS_TABS = [
  { label: 'All', value: 'All' },
  { label: 'Crafted', value: 'Crafted' },
  { label: 'Cancelled', value: 'Cancelled' }
];

const SORT_OPTIONS = [
  { label: 'Name', value: 'name' },
  { label: 'Date', value: 'date' },
  { label: 'Qty', value: 'qty' },
  { label: 'Operator', value: 'operator' }
];

const HistoryPanel = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortKey, setSortKey] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;


  const typeOptions = useMemo(() => [
    'All',
    ...Array.from(new Set(historyData.map((item) => item.type)))
  ], []);

  const statusCounts = useMemo(() => {
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

  const filteredData = useMemo(() => {
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
        return a[sortKey].toString().localeCompare(b[sortKey].toString());
      });
  }, [activeTab, statusFilter, typeFilter, sortKey, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const handlePageChange = (page) => {
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
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Crafted">Crafted</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="history-select-wrapper">
              <label>Type:</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="history-select-wrapper">
              <label>Sort:</label>
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
                  <button type="button" className="view-button">
                    View
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
