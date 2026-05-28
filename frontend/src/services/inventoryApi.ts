const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5253/api';

const DEFAULT_MIN_STOCK = 5;

type ItemDto = { ItemID: number; ItemName: string; ItemCategory: string; ProductionTime: number };
type BranchDto = { BranchID: number; BranchName: string };
type BranchItemCapacityDto = { BranchItemCapacityID: number; BranchID: number; ItemID: number; ItemQuantity: number };
type InventoryRowDto = {
  inventoryItemId: number;
  inventoryItemName: string;
  inventoryItemCategory: string;
  inventoryItemProductionTime: number;
  inventoryItemQuantity: number;
  inventoryItemBranchName: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`Fetch error ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export async function getItems(): Promise<ItemDto[]> {
  return fetchJson<ItemDto[]>(`${API_BASE}/Item/item/`);
}

export async function getBranchItems(): Promise<BranchItemCapacityDto[]> {
  return fetchJson<BranchItemCapacityDto[]>(`${API_BASE}/Item/Branch`);
}

export async function getBranches(): Promise<BranchDto[]> {
  return fetchJson<BranchDto[]>(`${API_BASE}/Branch`);
}

export type DashboardPreviewRow = { id: string | number; name: string; qty: number; location: string; status: string };

export type InventoryStat = {
  id: string;
  label: string;
  value: string | number;
};

export type InventoryTab = {
  id: string;
  label: string;
};

export type InventoryOverview = {
  items: InventoryItem[];
  previewRows: DashboardPreviewRow[];
  alerts: string[];
  stats: InventoryStat[];
  tabs: InventoryTab[];
};

function slugifyCategory(category: string): string {
  return category.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'misc';
}

function normalizeCategory(category: string | null | undefined): string {
  return category?.trim() || 'Misc';
}

function normalizeLocation(location: string | null | undefined): string {
  return location?.trim() || 'Unassigned';
}

function normalizeInventoryRow(row: InventoryRowDto): InventoryItem {
  const category = normalizeCategory(row.inventoryItemCategory);
  const quantity = row.inventoryItemQuantity ?? 0;
  const minStock = DEFAULT_MIN_STOCK;
  const status = quantity <= minStock ? 'LOW' : 'OK';

  return {
    id: row.inventoryItemId,
    name: row.inventoryItemName || `Item ${row.inventoryItemId}`,
    sku: `${category.slice(0, 3).toUpperCase()}-${row.inventoryItemId}`,
    category,
    quantity,
    minStock,
    location: normalizeLocation(row.inventoryItemBranchName),
    status,
    tab: slugifyCategory(category),
  };
}

export function buildInventoryOverview(items: InventoryItem[]): InventoryOverview {
  const categoryCounts = new Map<string, number>();
  const lowStockItems = items.filter((item) => item.status === 'LOW');

  items.forEach((item) => {
    categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1);
  });

  const previewRows: DashboardPreviewRow[] = items.slice(0, 8).map((item) => ({
    id: item.id,
    name: item.name,
    qty: item.quantity,
    location: item.location,
    status: item.status,
  }));

  const tabs: InventoryTab[] = [
    { id: 'all', label: `All (${items.length})` },
    ...Array.from(categoryCounts.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([category, count]) => ({
        id: slugifyCategory(category),
        label: `${category} (${count})`,
      })),
  ];

  const alerts = lowStockItems.slice(0, 3).map((item) => `${item.name} (${item.quantity} remaining)`);
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    previewRows,
    alerts,
    stats: [
      { id: 'totalItems', label: 'Total Items', value: items.length },
      { id: 'lowStock', label: 'Low Stock', value: lowStockItems.length },
      { id: 'totalUnits', label: 'Total Units', value: totalUnits.toLocaleString('en-ZA') },
      { id: 'categories', label: 'Categories', value: categoryCounts.size },
    ],
    tabs,
  };
}

export async function getDashboardPreview(): Promise<DashboardPreviewRow[]> {
  const overview = await getInventoryOverview();
  return overview.previewRows;
}

export type InventoryItem = {
  id: string | number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  location: string;
  status: string;
  tab?: string;
};

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const rows = await fetchJson<InventoryRowDto[]>(`${API_BASE}/Item/item/allInventoryItems`);

  // Collapse branch-level rows into per-item aggregates (sum quantities, choose primary location)
  const map = new Map<number, { id: number; name: string; category: string; sku: string; quantity: number; locations: Record<string, number>; productionTime?: number }>();

  for (const r of rows) {
    const id = r.inventoryItemId;
    const category = normalizeCategory(r.inventoryItemCategory);
    const name = r.inventoryItemName || `Item ${id}`;
    const sku = `${category.slice(0, 3).toUpperCase()}-${id}`;
    const qty = r.inventoryItemQuantity ?? 0;
    const loc = normalizeLocation(r.inventoryItemBranchName);

    if (!map.has(id)) {
      map.set(id, { id, name, category, sku, quantity: qty, locations: { [loc]: qty }, productionTime: r.inventoryItemProductionTime });
    } else {
      const entry = map.get(id)!;
      entry.quantity += qty;
      entry.locations[loc] = (entry.locations[loc] ?? 0) + qty;
    }
  }

  const items: InventoryItem[] = Array.from(map.values()).map((e) => {
    // pick primary location as the one with highest quantity
    const primaryLocation = Object.entries(e.locations).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Unassigned';
    const minStock = DEFAULT_MIN_STOCK;
    const status = e.quantity <= minStock ? 'LOW' : 'OK';

    return {
      id: e.id,
      name: e.name,
      sku: e.sku,
      category: e.category,
      quantity: e.quantity,
      minStock,
      location: primaryLocation,
      status,
      tab: slugifyCategory(e.category),
    };
  });

  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getInventoryOverview(): Promise<InventoryOverview> {
  const items = await getInventoryItems();
  return buildInventoryOverview(items);
}

const inventoryApi = {
  getItems,
  getBranchItems,
  getBranches,
  getDashboardPreview,
  getInventoryItems,
  getInventoryOverview,
  buildInventoryOverview,
};

export default inventoryApi;
