import React, { FC, useEffect, useState } from 'react';
import axios from 'axios';
import './craftingItems.css';
import unitIcon from '../../../../assets/images/uniitIcon.png';
import { calculateProgress, formatTimeLeft, normalizeQueueStatus } from '../../../../services/craftingUtils';

interface TiltsState {
  [key: string]: string;
}

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

type IngredientDto = {
  ingredientID?: number;
  itemID?: number;
  itemName?: string;
  quantity?: number;
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
};

const API_BASE = 'http://localhost:5253/api';

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

const CraftingItems: FC = () => {
  const [tilts, setTilts] = useState<TiltsState>({});
  const [activeJobs, setActiveJobs] = useState<CraftingJob[]>([]);

  const loadActiveJobs = async (): Promise<void> => {
    try {
      const [ordersResponse, usersResponse] = await Promise.all([
        axios.get<OrderDto[]>(`${API_BASE}/Order`, { withCredentials: true }),
        axios.get<EmployeeDto[]>(`${API_BASE}/User`, { withCredentials: true }),
      ]);

      const employees = usersResponse.data.reduce<Record<number, string>>((map, user) => {
        if (user.employeeId != null) {
          map[user.employeeId] = user.employeeName;
        }
        return map;
      }, {});

      const sortedOrders = ordersResponse.data.slice().sort((a, b) => new Date(a.createdDateTime).getTime() - new Date(b.createdDateTime).getTime());

      const normalizedOrders = sortedOrders.map((order) => {
        const rawStatus = normalizeQueueStatus(order.status);
        const isComplete = rawStatus !== 'Pending' && rawStatus !== 'Completed'
          && order.totalTime != null
          && order.timeElapsed != null
          && order.totalTime === order.timeElapsed;

        return {
          ...order,
          status: isComplete ? 'Completed' : rawStatus,
        } as OrderDto & { status: CraftingJob['status'] };
      });

      const activeOrPaused = normalizedOrders
        .filter((order) => order.status === 'Active' || order.status === 'Paused')
        .sort((a, b) => new Date(a.createdDateTime).getTime() - new Date(b.createdDateTime).getTime());
      const pending = normalizedOrders.filter((order) => order.status === 'Pending');
      const activeLimit = 3;
      const slots = Math.max(0, activeLimit - activeOrPaused.length);
      const toActivate = pending.slice(0, slots).map((order) => order.orderID);
      const toDemote = activeOrPaused.length > activeLimit ? activeOrPaused.slice(activeLimit).map((order) => order.orderID) : [];

      await Promise.all([
        ...toActivate.map((orderID) => updateOrderStatus(orderID, 'Active')),
        ...toDemote.map((orderID) => updateOrderStatus(orderID, 'Pending')),
      ]);

      const jobs = normalizedOrders.map((order) => {
        let jobStatus = order.status;
        if (toDemote.includes(order.orderID)) {
          jobStatus = 'Pending';
        } else if (order.status === 'Pending' && toActivate.includes(order.orderID)) {
          jobStatus = 'Active';
        }

        return {
          orderID: order.orderID,
          itemID: order.itemID,
          name: order.itemName || `Order ${order.orderID}`,
          qty: order.quantity ?? 1,
          status: jobStatus,
          progress: calculateProgress(order.totalTime, order.timeElapsed),
          timeLeft: formatTimeLeft(order.totalTime, order.timeElapsed),
          materials: [order.itemName || `Item ${order.itemID}`],
          employeeName: employees[order.employeeID ?? 0] ?? 'Unknown Employee',
        };
      }).filter((job) => job.status === 'Active' || job.status === 'Paused');

      const uniqueItemIds = Array.from(new Set(jobs.map((job) => job.itemID)));
      const ingredientResponses = await Promise.all(uniqueItemIds.map(async (itemID) => {
        try {
          return await axios.get<IngredientDto[]>(`${API_BASE}/Item/itemIngredient/item/${itemID}`, { withCredentials: true });
        } catch (error) {
          return null;
        }
      }));

      const ingredientsByItemId = uniqueItemIds.reduce<Record<number, string[]>>((map, itemID, index) => {
        const response = ingredientResponses[index];
        if (response?.data) {
          map[itemID] = response.data.map((ingredient) => {
            const name = ingredient.itemName ?? `Ingredient ${ingredient.ingredientID ?? ''}`;
            const quantity = ingredient.quantity ?? 1;
            return `${name} x${quantity}`;
          });
        }
        return map;
      }, {});

      setActiveJobs(jobs.map((job) => ({
        ...job,
        materials: ingredientsByItemId[job.itemID] ?? job.materials,
      })));
    } catch (error) {
      console.error('Unable to load crafting items orders', error);
    }
  };

  useEffect(() => {
    loadActiveJobs();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, id: string): void => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -1.3;
    const rotateY = (x - centerX) / centerX * 1.3;

    setTilts((prev) => ({
      ...prev,
      [id]: `scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    }));
  };

  const handleMouseLeave = (id: string): void => {
    setTilts((prev) => ({
      ...prev,
      [id]: '',
    }));
  };

  const handlePauseResume = async (job: CraftingJob): Promise<void> => {
    const nextStatus: CraftingJob['status'] = job.status === 'Paused' ? 'Active' : 'Paused';
    await updateOrderStatus(job.orderID, nextStatus);
    window.dispatchEvent(new CustomEvent('crafting-order-updated'));
    await loadActiveJobs();
  };

  return (
    <div className="active-grid">
      {activeJobs.length === 0 && <p className="empty-state">No active jobs available.</p>}
      {activeJobs.map((job) => (
        <div
          key={job.orderID}
          className="job-card"
          onMouseMove={(e) => handleMouseMove(e, String(job.orderID))}
          onMouseLeave={() => handleMouseLeave(String(job.orderID))}
          style={{ transform: tilts[String(job.orderID)] || '' }}
        >
          <div className="card-header">
            <div className="job-info-main">
              <div className="job-icon-box">
                <img src={unitIcon} alt={`${job.name} icon`} className="job-icon" />
              </div>
              <div className="job-titles">
                <h3>{job.name}</h3>
                <p>Employee: {job.employeeName} · Qty: {job.qty}</p>
              </div>
            </div>
            <span className={`status-badge ${job.status.toLowerCase().replace(' ', '-')}`}>
              {job.status}
            </span>
          </div>

          <div className="progress-section">
            <div className="progress-text">
              <span>{job.progress}% Complete</span>
              <span>{job.timeLeft}</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${job.progress}%` }}></div>
            </div>
          </div>

          <div className="materials-section">
            <p className="section-label">MATERIALS USED</p>
            <div className="material-tags">
              {job.materials.map((m, i) => (
                <span key={i} className="material-tag">{m}</span>
              ))}
            </div>
          </div>

          <div className="card-actions">
            <button className="btn-cancel" type="button">Cancel</button>
            <button
              className={`btn-action ${job.status === 'Paused' ? 'resume' : 'pause'}`}
              type="button"
              onClick={() => handlePauseResume(job)}
            >
              {job.status === 'Paused' ? 'Resume' : 'Pause'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CraftingItems;
