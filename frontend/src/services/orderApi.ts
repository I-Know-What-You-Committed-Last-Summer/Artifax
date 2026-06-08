import { calculateProgress, formatTimeLeft, normalizeQueueStatus, QueueJobStatus } from './craftingUtils';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5253/api';

type OrderItemDto = {
  itemName: string;
  quantity: number;
};

type OrderDto = {
  orderID: number;
  orderDateTime: string;
  status: string;
  orderItems: OrderItemDto[];
};

type OrderStatusUpdateDto = {
  status: string;
};

export type CraftingJobStatus = 'In Progress' | 'Paused' | 'Queued';

export type CraftingJob = {
  id: string;
  name: string;
  qty: number;
  status: CraftingJobStatus;
  progress: number;
  timeLeft: string;
  materials: string[];
  location: string;
  type: 'electronics' | 'mechanical' | 'logistics';
  icon: string;
};

export type QueueJob = {
  orderID: number;
  id: string;
  name: string;
  qty: number;
  status: QueueJobStatus;
  progress: number;
  timeLeft: string;
  materials: string[];
  employeeName: string;
  createdDateTime: string;
  location: string;
};

function fetchJson<T>(url: string): Promise<T> {
  return fetch(url, { credentials: 'include' }).then((response) => {
    if (!response.ok) {
      throw new Error(`Fetch error ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  });
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function normalizeStatus(status: string): CraftingJobStatus | null {
  const normalized = status.trim().toLowerCase();

  if (normalized === 'in progress') return 'In Progress';
  if (normalized === 'pending') return 'Queued';
  if (normalized === 'paused') return 'Paused';

  return null;
}

function deriveJobType(name: string): CraftingJob['type'] {
  const lower = name.toLowerCase();

  if (lower.includes('package') || lower.includes('box')) return 'logistics';
  if (lower.includes('board') || lower.includes('panel') || lower.includes('control') || lower.includes('circuit')) return 'electronics';

  return 'mechanical';
}

export async function getOrders(): Promise<OrderDto[]> {
  return fetchJson<OrderDto[]>(`${API_BASE}/Order`);
}

export async function getUsers(): Promise<any[]> {
  return fetchJson<any[]>(`${API_BASE}/User`);
}

export async function getCraftingQueue(): Promise<{ activeItems: QueueJob[]; queuedItems: QueueJob[] }> {
  const [orders, users] = await Promise.all([getOrders(), getUsers()]);

  const employeeMap = (users ?? []).reduce<Record<number, string>>((map, user: any) => {
    if (user.employeeId != null) {
      map[user.employeeId] = user.employeeName;
    }

    return map;
  }, {});

  const sortedOrders = (orders ?? []).slice()
    .sort((left, right) => new Date(left.orderDateTime).getTime() - new Date(right.orderDateTime).getTime())
    .filter((order) => {
      const status = normalizeQueueStatus(order.status);
      return status === 'Queued' || status === 'Active' || status === 'Paused';
    });

  const normalizedOrders = sortedOrders.map((order) => {
    const rawStatus = normalizeQueueStatus(order.status) ?? 'Queued';
    return {
      ...order,
      status: rawStatus,
    } as OrderDto & { status: QueueJobStatus };
  });

  const jobs = normalizedOrders.map((order) => {
    const totalTime = (order as any).totalTime;
    const timeElapsed = (order as any).timeElapsed;
    const items = order.orderItems ?? [];
    const materials = [items[0]?.itemName ?? `Item ${order.orderID}`];

    return {
      orderID: order.orderID,
      id: `order-${order.orderID}`,
      name: items[0]?.itemName ?? `Order ${order.orderID}`,
      qty: items.reduce((sum, item) => sum + (item.quantity ?? 0), 0) || items.length || 1,
      status: order.status,
      progress: calculateProgress(totalTime, timeElapsed),
      timeLeft: formatTimeLeft(totalTime, timeElapsed),
      materials,
      employeeName: employeeMap[(order as any).employeeID ?? 0] ?? 'Unknown Employee',
      createdDateTime: order.orderDateTime,
      location: `Order ${order.orderID}`,
    } satisfies QueueJob;
  });

  return {
    activeItems: jobs.filter((job) => job.status === 'Active' || job.status === 'Paused'),
    queuedItems: jobs.filter((job) => job.status === 'Queued'),
  };
}

export async function getCraftingJobs(): Promise<CraftingJob[]> {
  const orders = await getOrders();

  return orders
    .map((order) => {
      const status = normalizeStatus(order.status);

      if (status == null) {
        return null;
      }

      const totalQuantity = order.orderItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
      const primaryItem = order.orderItems[0]?.itemName ?? `Order #${order.orderID}`;
      const materialLabels = order.orderItems.map((item) => `${item.itemName} x${item.quantity}`);

      return {
        id: `order-${order.orderID}`,
        name: primaryItem,
        qty: totalQuantity || order.orderItems.length || 1,
        status,
        progress: status === 'In Progress' ? 45 : 0,
        timeLeft: formatDateTime(order.orderDateTime),
        materials: materialLabels,
        location: `Order ${order.orderID}`,
        type: deriveJobType(primaryItem),
        icon: 'unitIcon',
      } satisfies CraftingJob;
    })
    .filter((job): job is CraftingJob => job != null)
    .sort((left, right) => {
      if (left.status !== right.status) {
        return left.status === 'In Progress' ? -1 : 1;
      }

      return left.id.localeCompare(right.id);
    });
}

export async function getActiveAndQueuedJobs(): Promise<{ activeItems: CraftingJob[]; queuedItems: CraftingJob[] }> {
  const jobs = await getCraftingJobs();

  return {
    activeItems: jobs.filter((job) => job.status !== 'Queued'),
    queuedItems: jobs.filter((job) => job.status === 'Queued'),
  };
}

export async function updateOrderStatus(orderId: number, status: string): Promise<void> {
  const response = await fetch(`${API_BASE}/Order/${orderId}/status`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status } satisfies OrderStatusUpdateDto),
  });

  if (!response.ok) {
    throw new Error(`Fetch error ${response.status} ${response.statusText}`);
  }
}

export async function deleteOrder(orderId: number): Promise<void> {
  const response = await fetch(`${API_BASE}/Order/${orderId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Fetch error ${response.status} ${response.statusText}`);
  }
}

const orderApi = {
  getOrders,
  getCraftingJobs,
  getActiveAndQueuedJobs,
  updateOrderStatus,
  deleteOrder,
};

export default orderApi;