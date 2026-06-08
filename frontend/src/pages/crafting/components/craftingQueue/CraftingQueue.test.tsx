import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import CraftingQueue from './craftingQueue';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CraftingQueue', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders 3 active crafts when the backend has 3 active or paused orders', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.endsWith('/Order')) {
        return Promise.resolve({ data: [
          { orderID: 1, itemID: 101, itemName: 'Item A', quantity: 2, createdDateTime: '2025-01-01T08:00:00Z', totalTime: 100, timeElapsed: 15, status: 'Active', employeeID: 1 },
          { orderID: 2, itemID: 102, itemName: 'Item B', quantity: 1, createdDateTime: '2025-01-01T09:00:00Z', totalTime: 50, timeElapsed: 30, status: 'Paused', employeeID: 2 },
          { orderID: 3, itemID: 103, itemName: 'Item C', quantity: 4, createdDateTime: '2025-01-01T10:00:00Z', totalTime: 80, timeElapsed: 20, status: 'Active', employeeID: 3 },
        ] });
      }

      if (url.endsWith('/User')) {
        return Promise.resolve({ data: [
          { employeeId: 1, employeeName: 'Alice' },
          { employeeId: 2, employeeName: 'Bob' },
          { employeeId: 3, employeeName: 'Charlie' },
        ] });
      }

      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.put.mockResolvedValue({});

    render(<CraftingQueue />);

    await waitFor(() => {
      expect(screen.getByText(/Item A x2/i)).toBeInTheDocument();
      expect(screen.getByText(/Item B x1/i)).toBeInTheDocument();
      expect(screen.getByText(/Item C x4/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/^Active$/i).length + screen.getAllByText(/^Paused$/i).length).toBe(3);
    expect(screen.getByText(/3 \/ 3/i)).toBeInTheDocument();
  });

  it('caps active crafts at 3 when the backend returns more than 3 active or paused orders', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.endsWith('/Order')) {
        return Promise.resolve({ data: [
          { orderID: 1, itemID: 101, itemName: 'Item A', quantity: 2, createdDateTime: '2025-01-01T08:00:00Z', totalTime: 100, timeElapsed: 15, status: 'Active', employeeID: 1 },
          { orderID: 2, itemID: 102, itemName: 'Item B', quantity: 1, createdDateTime: '2025-01-01T09:00:00Z', totalTime: 50, timeElapsed: 30, status: 'Paused', employeeID: 2 },
          { orderID: 3, itemID: 103, itemName: 'Item C', quantity: 4, createdDateTime: '2025-01-01T10:00:00Z', totalTime: 80, timeElapsed: 20, status: 'Active', employeeID: 3 },
          { orderID: 4, itemID: 104, itemName: 'Item D', quantity: 1, createdDateTime: '2025-01-01T11:00:00Z', totalTime: 90, timeElapsed: 40, status: 'Active', employeeID: 4 },
        ] });
      }

      if (url.endsWith('/User')) {
        return Promise.resolve({ data: [
          { employeeId: 1, employeeName: 'Alice' },
          { employeeId: 2, employeeName: 'Bob' },
          { employeeId: 3, employeeName: 'Charlie' },
          { employeeId: 4, employeeName: 'Dana' },
        ] });
      }

      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.put.mockResolvedValue({});

    render(<CraftingQueue />);

    await waitFor(() => {
      expect(screen.getByText(/3 \/ 3/i)).toBeInTheDocument();
      expect(screen.getByText(/Item D x1/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/^Active$/i).length + screen.getAllByText(/^Paused$/i).length).toBe(3);
  });
});
