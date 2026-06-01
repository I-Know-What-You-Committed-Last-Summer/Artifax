jest.mock('../../../services/inventoryApi', () => {
  const actual = jest.requireActual('../../../services/inventoryApi');
  return {
    ...actual,
    getInventoryOverview: jest.fn(),
    getItemMaterialDetails: jest.fn(),
    getItems: jest.fn(),
  };
});
jest.mock('../components/InventoryItemEditModal', () => () => null);
jest.mock('../components/InventoryItemCreateModal', () => () => null);
jest.mock('../components/InventoryItemIngredientModal', () => () => null);
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InventoryPage from '../InventoryPage';
import * as inventoryApi from '../../../services/inventoryApi';

describe('InventoryPage', () => {
  it('renders inventory rows from overview and expands inline materials', async () => {
    (inventoryApi.getInventoryOverview as jest.Mock).mockResolvedValue({
      items: [
        {
          id: 1,
          name: 'Widget',
          sku: 'WGT-1',
          category: 'Parts',
          quantity: 12,
          minStock: 5,
          location: 'Zone X',
          status: 'OK',
          tab: 'all',
        },
      ],
      previewRows: [],
      alerts: [],
      stats: [],
      tabs: [],
    });

    (inventoryApi.getItemMaterialDetails as jest.Mock).mockResolvedValue({
      itemId: 1,
      itemName: 'Widget',
      category: 'Parts',
      productionTime: 42,
      ingredients: [
        {
          ingredientId: 11,
          name: 'Screw',
          category: 'Hardware',
          requiredQuantity: 2,
          availableQuantity: 1,
          branches: [{ branchName: 'Johannesburg', quantity: 1 }],
        },
      ],
    });

    (inventoryApi.getItems as jest.Mock).mockResolvedValue([
      { ItemID: 1, ItemName: 'Widget', ItemCategory: 'Parts', ProductionTime: 42 },
      { ItemID: 11, ItemName: 'Screw', ItemCategory: 'Hardware', ProductionTime: 0 },
    ]);

    render(<InventoryPage />);

    expect(screen.getByText(/Inventory Management/i)).toBeInTheDocument();

    await waitFor(() => expect(inventoryApi.getInventoryOverview).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText('Widget')).toBeInTheDocument());
    expect(screen.getByText('Zone X')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /View Widget/i }));

    await waitFor(() => expect(screen.getByText('Materials')).toBeInTheDocument());
    expect(screen.getByText('Screw')).toBeInTheDocument();
  });
});
