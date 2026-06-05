import React, { FC, useEffect, useState } from 'react';
import './craftingItems.css';
import unitIcon from '../../../../assets/images/uniitIcon.png';
import { useApi } from '../../../../hooks';
import { calculateProgress, formatTimeLeft, normalizeQueueStatus, QueueJobStatus } from '../../../../services/craftingUtils';

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
  orderExpedite?: boolean;
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
  status: QueueJobStatus;
  progress: number;
  timeLeft: string;
  materials: string[];
  employeeName: string;
};

const CraftingItems: FC = () => {
  const api = useApi();
  const [tilts, setTilts] = useState<TiltsState>({});
  const [activeJobs, setActiveJobs] = useState<CraftingJob[]>([]);

  const ORDER_REFRESH_INTERVAL_MS = 60_000;

  const loadActiveJobs = async (): Promise<void> => {
    try {
      const [ordersResponse, usersResponse] = await Promise.all([
        api.get<OrderDto[]>('/Order'),
        api.get<EmployeeDto[]>('/User'),
      ]);

      const employees = usersResponse.data.reduce<Record<number, string>>((map, user) => {
        if (user.employeeId != null) {
          map[user.employeeId] = user.employeeName;
        }
        return map;
      }, {});

      const sortedOrders = ordersResponse.data
        .slice()
        .sort((a, b) => new Date(a.createdDateTime).getTime() - new Date(b.createdDateTime).getTime())
        .filter((order) => {
          const status = normalizeQueueStatus(order.status);
          // Only show Active or Paused orders
          return status === 'Active' || status === 'Paused';
        });

      const jobs = sortedOrders.map((order) => {
        const expedited = order.orderExpedite === true;
        const status = normalizeQueueStatus(order.status) ?? 'Paused';

        return {
          orderID: order.orderID,
          itemID: order.itemID,
          name: order.itemName || `Order ${order.orderID}`,
          qty: order.quantity ?? 1,
          status,
          progress: calculateProgress(order.totalTime, order.timeElapsed, expedited),
          timeLeft: formatTimeLeft(order.totalTime, order.timeElapsed, expedited),
          materials: [order.itemName || `Item ${order.itemID}`],
          employeeName: employees[order.employeeID ?? 0] ?? 'Unknown Employee',
        };
      });

      const uniqueItemIds = Array.from(new Set(jobs.map((job) => job.itemID)));
      const ingredientResponses = await Promise.all(
        uniqueItemIds.map(async (itemID) => {
          try {
            return await api.get<IngredientDto[]>(`/Item/itemIngredient/item/${itemID}`);
          } catch (error) {
            return null;
          }
        })
      );

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

      setActiveJobs(
        jobs.map((job) => ({
          ...job,
          materials: ingredientsByItemId[job.itemID] ?? job.materials,
        }))
      );
    } catch (error) {
      console.error('Unable to load crafting items orders', error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const refresh = async (): Promise<void> => {
      if (!isMounted) return;
      await loadActiveJobs();
    };

    const handleOrderUpdated = (): void => {
      void refresh();
    };

    void refresh();
    intervalId = setInterval(() => {
      void refresh();
    }, ORDER_REFRESH_INTERVAL_MS);

    window.addEventListener('crafting-order-updated', handleOrderUpdated);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
      window.removeEventListener('crafting-order-updated', handleOrderUpdated);
    };
  }, [api]);

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
    const nextStatus = job.status === 'Paused' ? 'Active' : 'Paused';
    try {
      await api.put(`/Order/${job.orderID}/status`, { status: nextStatus });
      window.dispatchEvent(new CustomEvent('crafting-order-updated'));
      await loadActiveJobs();
    } catch (error) {
      console.error(`Unable to update order ${job.orderID} status to ${nextStatus}`, error);
    }
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
