import inventoryApi, {
  getInventoryItems,
  getItemMaterialDetails,
  DashboardPreviewRow,
} from '../inventoryApi';

const ORIGINAL_FETCH = (global as any).fetch;

afterEach(() => {
  (global as any).fetch = ORIGINAL_FETCH;
  jest.restoreAllMocks();
});

test('getInventoryItems collapses branch rows into items', async () => {
  const rows = [
    {
      inventoryItemId: 1,
      inventoryItemName: 'Widget',
      inventoryItemCategory: 'Tools',
      inventoryItemProductionTime: 10,
      inventoryItemQuantity: 2,
      inventoryItemBranchName: 'Branch A',
    },
    {
      inventoryItemId: 1,
      inventoryItemName: 'Widget',
      inventoryItemCategory: 'Tools',
      inventoryItemProductionTime: 10,
      inventoryItemQuantity: 3,
      inventoryItemBranchName: 'Branch B',
    },
    {
      inventoryItemId: 2,
      inventoryItemName: 'Gadget',
      inventoryItemCategory: 'Electronics',
      inventoryItemProductionTime: 5,
      inventoryItemQuantity: 10,
      inventoryItemBranchName: 'Branch A',
    },
  ];

  (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => rows });

  const items = await getInventoryItems();

  const widget = items.find((i) => i.id === '1');
  const gadget = items.find((i) => i.id === '2');

  expect(widget).toBeDefined();
  expect(widget!.quantity).toBe(5);
  expect(widget!.location).toMatch(/Branch [AB]/);
  expect(gadget).toBeDefined();
  expect(gadget!.quantity).toBe(10);
});

test('getItemMaterialDetails returns null for missing item and builds ingredient branches', async () => {
  const itemId = 42;

  const item = { ItemID: itemId, ItemName: 'Sample Item', ItemCategory: 'Misc', ProductionTime: 2 };

  const ingredients = [
    { ingredientID: 101, itemName: 'Part A', itemCategory: 'Metal', quantity: 2 },
    { ingredientID: 102, itemName: 'Part B', itemCategory: 'Plastic', quantity: 1 },
  ];

  const inventoryRows = [
    { inventoryItemId: 101, inventoryItemName: 'Part A', inventoryItemCategory: 'Metal', inventoryItemProductionTime: 0, inventoryItemQuantity: 3, inventoryItemBranchName: 'Branch X' },
    { inventoryItemId: 101, inventoryItemName: 'Part A', inventoryItemCategory: 'Metal', inventoryItemProductionTime: 0, inventoryItemQuantity: 1, inventoryItemBranchName: 'Branch Y' },
    { inventoryItemId: 102, inventoryItemName: 'Part B', inventoryItemCategory: 'Plastic', inventoryItemProductionTime: 0, inventoryItemQuantity: 0, inventoryItemBranchName: 'Branch X' },
  ];

  (global as any).fetch = jest.fn((url: string) => {
    if (String(url).includes(`/Item/item/${itemId}`)) {
      return Promise.resolve({ ok: true, json: async () => item });
    }

    if (String(url).includes(`/Item/itemIngredient/item/${itemId}`)) {
      return Promise.resolve({ ok: true, json: async () => ingredients });
    }

    if (String(url).includes(`/Item/item/allInventoryItems`)) {
      return Promise.resolve({ ok: true, json: async () => inventoryRows });
    }

    return Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' });
  });

  const details = await getItemMaterialDetails(itemId);

  expect(details).not.toBeNull();
  expect(details!.ingredients).toHaveLength(2);

  const partA = details!.ingredients.find((ing) => ing.ingredientId === 101);
  expect(partA).toBeDefined();
  expect(partA!.availableQuantity).toBe(4);
  expect(partA!.branches.length).toBeGreaterThanOrEqual(1);
});
import { getItemCategoryOptions } from '../inventoryApi';

describe('getItemCategoryOptions', () => {
  it('deduplicates, trims, filters blanks, and sorts categories', () => {
    const items = [
      { ItemCategory: 'Furniture' },
      { ItemCategory: '  Metals  ' },
      { ItemCategory: 'Furniture' },
      { ItemCategory: '' },
      { ItemCategory: '   ' },
    ];

    expect(getItemCategoryOptions(items)).toEqual(['Furniture', 'Metals']);
  });
});