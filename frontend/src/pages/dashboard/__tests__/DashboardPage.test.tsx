import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '../DashboardPage';
import * as inventoryApi from '../../../services/inventoryApi';

jest.mock('../../../services/inventoryApi');

describe('DashboardPage', () => {
  it('renders preview rows from API', async () => {
    (inventoryApi.getDashboardPreview as jest.Mock).mockResolvedValue([
      { id: 1, name: 'Test Item', qty: 42, location: 'Zone Test', status: 'OK' },
    ]);

    render(<DashboardPage />);

    // Header loads immediately
    expect(screen.getByText(/Inventory & Crafting/i)).toBeInTheDocument();

    // Wait for API data to render
    await waitFor(() => expect(screen.getByText('Test Item')).toBeInTheDocument());
    expect(screen.getByText('Zone Test')).toBeInTheDocument();
  });
});
