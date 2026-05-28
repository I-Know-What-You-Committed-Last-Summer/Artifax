import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '../DashboardPage';
import * as inventoryApi from '../../../services/inventoryApi';

jest.mock('../../../services/inventoryApi', () => {
  const actual = jest.requireActual('../../../services/inventoryApi');
  return {
    ...actual,
    getInventoryItems: jest.fn(),
  };
});

describe('DashboardPage', () => {
  it('renders preview rows from API', async () => {
    (inventoryApi.getInventoryItems as jest.Mock).mockResolvedValue([
      {
        id: 1,
        name: 'Test Item',
        sku: 'TES-1',
        category: 'Testing',
        quantity: 42,
        minStock: 5,
        location: 'Zone Test',
        status: 'OK',
        tab: 'testing',
      },
    ]);

    render(<DashboardPage />);

    // Header loads immediately
    expect(screen.getByText(/Inventory & Crafting/i)).toBeInTheDocument();

    // Wait for API data to render
    await waitFor(() => expect(screen.getByText('Test Item')).toBeInTheDocument());
    expect(screen.getByText('Zone Test')).toBeInTheDocument();
  });
});
