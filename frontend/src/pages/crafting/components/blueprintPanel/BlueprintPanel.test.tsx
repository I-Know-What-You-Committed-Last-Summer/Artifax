import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import BlueprintPanel from './blueprintPanel';

// Mock responses for the backend endpoints used by BlueprintPanel.
// These fixtures let the test verify that the component receives data
// from the API and renders blueprint content without requiring a real backend.
const mockBlueprintsResponse = [
  {
    itemID: 1,
    itemName: 'Pot',
    itemCategory: 'other',
    productionTime: 10,
    ingredients: [
      { itemName: 'Iron Ingot', quantity: 2 }
    ]
  }
];

const mockItemsResponse = [
  { itemID: 101, itemName: 'Iron Ingot' }
];

const mockBranchResponse = [
  { itemID: 101, itemQuantity: 5 }
];

describe('BlueprintPanel', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn((url: RequestInfo) => {
      if (url === 'http://localhost:5253/api/Item/item/allItemBlueprints') {
        // Return the blueprint list when the component requests all blueprint items.
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockBlueprintsResponse) } as Response);
      }
      if (url === 'http://localhost:5253/api/Item/item') {
        // Return item metadata used to build the inventory mapping.
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockItemsResponse) } as Response);
      }
      if (url === 'http://localhost:5253/api/Item/Branch') {
        // Return branch inventory quantities used to calculate "have" values.
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockBranchResponse) } as Response);
      }
      return Promise.resolve({ ok: false, statusText: 'Not Found' } as Response);
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('fetches blueprint data from the backend and renders received items', async () => {
    const handleSelectBlueprint = jest.fn();
    const handleFilterChange = jest.fn();
    const handleCreateBlueprint = jest.fn();

    render(
      <BlueprintPanel
        selectedBlueprintId=""
        filter="all"
        onFilterChange={handleFilterChange}
        onSelectBlueprint={handleSelectBlueprint}
        onCreateBlueprint={handleCreateBlueprint}
      />
    );

    // Verify the first API call to fetch the blueprints list happened.
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5253/api/Item/item/allItemBlueprints');

    // Wait for the component to render the blueprint item from the mocked API response.
    await waitFor(() => {
      expect(screen.getByText(/Pot/i)).toBeInTheDocument();
    });

    // Confirm the component also requested the inventory endpoints needed to compute "have" values.
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5253/api/Item/item');
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5253/api/Item/Branch');
    expect(screen.queryByText(/Loading blueprints.../i)).not.toBeInTheDocument();
  });
});
