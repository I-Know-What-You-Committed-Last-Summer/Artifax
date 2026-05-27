jest.mock('../../../services/inventoryApi');
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import InventoryPage from '../InventoryPage';
import * as inventoryApi from '../../../services/inventoryApi';

describe('InventoryPage', () => {
  it('renders inventory rows from API', async () => {
    (inventoryApi.getInventoryItems as jest.Mock).mockResolvedValue([
      {
        id: 'it-1',
        name: 'Widget',
        sku: 'WGT-1',
        category: 'Parts',
        quantity: 12,
        minStock: 5,
        location: 'Zone X',
        status: 'OK',
      },
    ]);

    render(<InventoryPage />);

    expect(screen.getByText(/Inventory Management/i)).toBeInTheDocument();

    await waitFor(() => expect(inventoryApi.getInventoryItems).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText('Widget')).toBeInTheDocument());
    expect(screen.getByText('Zone X')).toBeInTheDocument();
  });
});
