const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5253/api';

type ItemDto = { ItemID: number; ItemName: string; ItemCategory: string; ProductionTime: number };
type BranchDto = { BranchID: number; BranchName: string };
type BranchItemCapacityDto = { BranchItemCapacityID: number; BranchID: number; ItemID: number; ItemQuantity: number };

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

export async function getDashboardPreview(): Promise<DashboardPreviewRow[]> {
  // Fetch items, branch capacities and branches, then join them to build preview rows
  const [items, branchItems, branches] = await Promise.all([getItems(), getBranchItems(), getBranches()]);

  // Map for quick lookup
  const itemById = new Map<number, ItemDto>();
  items.forEach((i) => itemById.set(i.ItemID, i));

  const branchById = new Map<number, BranchDto>();
  branches.forEach((b) => branchById.set(b.BranchID, b));

  // Build preview rows: for each branch item, pair with item and branch info
  const rows: DashboardPreviewRow[] = branchItems.map((bic) => {
    const item = itemById.get(bic.ItemID);
    const branch = branchById.get(bic.BranchID);
    const qty = bic.ItemQuantity ?? 0;
    const status = qty <= 5 ? 'LOW' : 'OK';
    return {
      id: item?.ItemID ?? `${bic.ItemID}-${bic.BranchID}`,
      name: item?.ItemName ?? `Item ${bic.ItemID}`,
      qty,
      location: branch?.BranchName ?? `Branch ${bic.BranchID}`,
      status,
    };
  });

  // Sort by name to provide stable preview order
  rows.sort((a, b) => a.name.localeCompare(b.name));
  return rows;
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
  const [items, branchItems, branches] = await Promise.all([getItems(), getBranchItems(), getBranches()]);

  const itemById = new Map<number, ItemDto>();
  items.forEach((i) => itemById.set(i.ItemID, i));

  const branchById = new Map<number, BranchDto>();
  branches.forEach((b) => branchById.set(b.BranchID, b));

  // Collapse branchItems to per-item totals and pick primary branch name
  const collapsed = new Map<number, { quantity: number; branchName?: string }>();
  branchItems.forEach((bic) => {
    const existing = collapsed.get(bic.ItemID) ?? { quantity: 0 };
    existing.quantity += bic.ItemQuantity ?? 0;
    if (!existing.branchName) existing.branchName = branchById.get(bic.BranchID)?.BranchName;
    collapsed.set(bic.ItemID, existing);
  });

  const result: InventoryItem[] = [];
  itemById.forEach((item, id) => {
    const collapsedEntry = collapsed.get(id);
    const quantity = collapsedEntry?.quantity ?? 0;
    const location = collapsedEntry?.branchName ?? 'Main';
    const minStock = 5; // sensible default until backend provides this
    const status = quantity <= minStock ? 'LOW' : 'OK';
    result.push({
      id: item.ItemID,
      name: item.ItemName,
      sku: `ITM-${item.ItemID}`,
      category: item.ItemCategory ?? 'Misc',
      quantity,
      minStock,
      location,
      status,
      tab: 'all',
    });
  });

  // Stable sort by name
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

export default { getItems, getBranchItems, getBranches, getDashboardPreview, getInventoryItems };
