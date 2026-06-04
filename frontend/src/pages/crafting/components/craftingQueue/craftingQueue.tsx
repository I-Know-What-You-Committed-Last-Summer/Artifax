import React, { FC, useEffect, useState } from 'react';
import axios from 'axios';
import './craftingQueue.css';
import unitIcon from '../../../../assets/images/uniitIcon.png';

const itemsPerPage = 3;
const API_BASE = 'http://localhost:5253/api';

type OrderDto = {
  orderID: number;
  itemID: number;
  itemName: string;
  quantity: number;
  createdDateTime: string;
  totalTime?: number;
  timeElapsed?: number;
  status: string;
  employeeID?: number;
};

type EmployeeDto = {
  employeeId: number;
  employeeName: string;
};

type CraftingJob = {
  orderID: number;
  itemID: number;
  name: string;
  qty: number;
  status: 'Pending' | 'Active' | 'Paused' | 'Completed';
  progress: number;
  timeLeft: string;
  materials: string[];
  employeeName: string;
  createdDateTime: string;
};

function normalizeStatus(status: string): CraftingJob['status'] {
  const normalized = status?.trim().toLowerCase();

  if (normalized === 'active' || normalized === 'in progress') return 'Active';
  if (normalized === 'paused') return 'Paused';
  if (normalized === 'completed') return 'Completed';

  return 'Pending';
}

function parseDate(value: string): number {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function calculateProgress(totalTime?: number, timeElapsed?: number): number {
  if (totalTime == null || totalTime === 0 || timeElapsed == null) return 0;
  return Math.min(100, Math.max(0, Math.round((timeElapsed / totalTime) * 100)));
}

function formatTimeLeft(totalTime?: number, timeElapsed?: number): string {
  if (totalTime == null || timeElapsed == null) {
    return 'No estimate';
  }

  const remaining = Math.max(0, totalTime - timeElapsed);
  return remaining === 0 ? 'Complete' : `${remaining} min left`;
}

async function updateOrderStatus(orderID: number, status: string): Promise<void> {
  try {
    await axios.put(`${API_BASE}/Order/${orderID}/status`, {
      status,
    }, {
      withCredentials: true,
    });
  } catch (error) {
    console.warn(`Unable to update order ${orderID} status to ${status}`, error);
  }
}

const CraftingQueue: FC = () => {
  const [page, setPage] = useState<number>(1);
  const [activeJobs, setActiveJobs] = useState<CraftingJob[]>([]);
  const [queuedJobs, setQueuedJobs] = useState<CraftingJob[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async (): Promise<void> => {
      try {
        const [ordersResponse, userResponse] = await Promise.all([
          axios.get<OrderDto[]>(`${API_BASE}/Order`, { withCredentials: true }),
          axios.get<EmployeeDto[]>(`${API_BASE}/User`, { withCredentials: true }),
        ]);

        const employees = userResponse.data.reduce<Record<number, string>>((map, user) => {
          if (user.employeeId != null) {
            map[user.employeeId] = user.employeeName;
          }
          return map;
        }, {});

        const orders = ordersResponse.data.slice().sort((a, b) => parseDate(a.createdDateTime) - parseDate(b.createdDateTime));
        const resolvedOrders = orders.map((order) => {
          const rawStatus = normalizeStatus(order.status);
          const isComplete = rawStatus !== 'Pending' && rawStatus !== 'Completed'
            && order.totalTime != null
            && order.timeElapsed != null
            && order.totalTime === order.timeElapsed;

          return {
            ...order,
            status: isComplete ? 'Completed' : rawStatus,
          } as OrderDto & { status: CraftingJob['status'] };
        });

        const activeOrPaused = resolvedOrders
          .filter((order) => order.status === 'Active' || order.status === 'Paused')
          .sort((a, b) => parseDate(a.createdDateTime) - parseDate(b.createdDateTime));
        const pending = resolvedOrders.filter((order) => order.status === 'Pending');
        const activeLimit = 3;
        const slots = Math.max(0, activeLimit - activeOrPaused.length);
        const toActivate = pending.slice(0, slots).map((item) => item.orderID);
        const toDemote = activeOrPaused.length > activeLimit ? activeOrPaused.slice(activeLimit).map((item) => item.orderID) : [];

        await Promise.all([
          ...toActivate.map((orderID) => updateOrderStatus(orderID, 'Active')),
          ...toDemote.map((orderID) => updateOrderStatus(orderID, 'Pending')),
        ]);

        const jobs = resolvedOrders.map((order) => {
          let status = order.status;
          if (toDemote.includes(order.orderID)) {
            status = 'Pending';
          } else if (order.status === 'Pending' && toActivate.includes(order.orderID)) {
            status = 'Active';
          }

          return {
            orderID: order.orderID,
            itemID: order.itemID,
            name: order.itemName || `Order ${order.orderID}`,
            qty: order.quantity ?? 1,
            status,
            progress: calculateProgress(order.totalTime, order.timeElapsed),
            timeLeft: formatTimeLeft(order.totalTime, order.timeElapsed),
            materials: [order.itemName || `Item ${order.itemID}`],
            employeeName: employees[order.employeeID ?? 0] ?? 'Unknown Employee',
            createdDateTime: order.createdDateTime,
          };
        });

        if (!isMounted) return;

        setActiveJobs(jobs.filter((job) => job.status === 'Active' || job.status === 'Paused'));
        setQueuedJobs(jobs.filter((job) => job.status === 'Pending'));
      } catch (error) {
        console.error('Failed to load crafting queue orders', error);
      }
    };

    loadJobs();

    const listener = (): void => {
      if (isMounted) {
        loadJobs();
      }
    };

    window.addEventListener('crafting-order-updated', listener);

    return () => {
      isMounted = false;
      window.removeEventListener('crafting-order-updated', listener);
    };
  }, []);

  const handlePrevious = (): void => setPage((prev) => Math.max(1, prev - 1));
  const handleNext = (): void => setPage((prev) => Math.min(Math.max(1, Math.ceil(queuedJobs.length / itemsPerPage)), prev + 1));

  const totalPages = Math.max(1, Math.ceil(queuedJobs.length / itemsPerPage));
  const pageItems = queuedJobs.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const activeCount = activeJobs.length;

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  return (
    <div className="queue-sidebar">
      <div className="queue-header">
        <div className="queue-title-row">
          <h3>Crafting Queue</h3>
          <span className="queue-count">{activeCount} / 3</span>
        </div>
        <p className="limit-note">Maximum 3 active crafts per location</p>
      </div>

      <div className="queue-section">
        <h4 className="queue-section-title">Active Crafts</h4>
        {activeJobs.length === 0 && <p className="empty-state">No active crafts right now.</p>}
        {activeJobs.map((item) => (
          <div key={item.orderID} className="queue-item">
            <div className="queue-item-header">
              <div className="item-info">
                <img src={unitIcon} alt={`${item.name} icon`} className="queue-item-icon" />
                <div>
                  <h4>{item.name} x{item.qty}</h4>
                  <p>{item.status} · {item.employeeName}</p>
                </div>
              </div>
              <span className={`queue-badge ${item.status.toLowerCase().replace(' ', '-')}`}>
                {item.status}
              </span>
            </div>
            <div className="waiting-status">
              <span>{item.progress}% complete</span>
              <span>{item.timeLeft}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="queue-section">
        <h4 className="queue-section-title">Up Next</h4>
        {pageItems.length === 0 && <p className="empty-state">No queued items ready yet.</p>}
        {pageItems.map((item) => (
          <div key={item.orderID} className="queue-item">
            <div className="queue-item-header">
              <div className="item-info">
                <img src={unitIcon} alt={`${item.name} icon`} className="queue-item-icon" />
                <div>
                  <h4>{item.name} x{item.qty}</h4>
                  <p>Queued · Created {new Intl.DateTimeFormat('en-ZA', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.createdDateTime))}</p>
                </div>
              </div>
              <span className={`queue-badge ${item.status.toLowerCase().replace(' ', '-')}`}>
                {item.status}
              </span>
            </div>
            <div className="waiting-status">
              <span>Waiting to start</span>
              <span>{item.timeLeft}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="queue-footer">
        <button type="button" onClick={handlePrevious} disabled={page === 1}>Prev</button>
        <span>Page {page} / {totalPages}</span>
        <button type="button" onClick={handleNext} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
};

export default CraftingQueue;
