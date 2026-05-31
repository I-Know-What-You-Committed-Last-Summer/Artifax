import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Crafting from './crafting';

jest.mock('../../components/layout/AlertStrip', () => ({
  __esModule: true,
  default: ({ label, items }: any) => (
    <div>
      <span>{label}</span>
      <span>{items?.join(',')}</span>
    </div>
  ),
}));

jest.mock('../../components/layout/PageHeader', () => ({
  __esModule: true,
  default: ({ title, subtitle }: any) => (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}));

jest.mock('./components/craftingNav/craftingNav', () => ({
  __esModule: true,
  default: ({ onTabChange, onCreateBlueprint }: any) => (
    <div>
      <button onClick={() => onTabChange('history')}>History</button>
      <button onClick={() => onTabChange('craft')}>Craft</button>
      <button onClick={onCreateBlueprint}>Create</button>
    </div>
  ),
}));

jest.mock('./components/stats/stats', () => ({
  __esModule: true,
  default: () => <div>StatsGrid stub</div>,
}));

jest.mock('./components/historyStats/historyStats', () => ({
  __esModule: true,
  default: () => <div>HistoryStats stub</div>,
}));

jest.mock('./components/historyPanel/historyPanel', () => ({
  __esModule: true,
  default: () => <div>HistoryPanel stub</div>,
}));

jest.mock('./components/craftingItems/craftingItems', () => ({
  __esModule: true,
  default: () => <div>CraftingItems stub</div>,
}));

jest.mock('./components/craftingQueue/craftingQueue', () => ({
  __esModule: true,
  default: () => <div>CraftingQueue stub</div>,
}));

jest.mock('./components/craftPanel/craftPanel', () => ({
  __esModule: true,
  default: ({ blueprint, amount, onAmountChange, onCraft }: any) => (
    <div>
      <div>Craft Panel</div>
      <div>{blueprint?.name ?? 'No blueprint selected'}</div>
      <button onClick={() => onAmountChange(amount + 1)}>Increment</button>
      <button onClick={onCraft}>Craft</button>
    </div>
  ),
}));

jest.mock('./components/blueprintPanel/blueprintPanel', () => ({
  __esModule: true,
  default: ({ onSelectBlueprint }: any) => (
    <button onClick={() => onSelectBlueprint('bp-101')}>Select blueprint</button>
  ),
}));

jest.mock('./components/newBlueprint/newBlueprint', () => ({
  __esModule: true,
  default: ({ onCancel }: any) => (
    <div>
      <div>NewBlueprint stub</div>
      <button onClick={onCancel}>Cancel New</button>
    </div>
  ),
}));

describe('Crafting page', () => {
  beforeEach(() => {
    (global.fetch as any) = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ itemID: 101, itemName: 'Round Table', productionTime: 20, itemCategory: 'furniture' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ itemName: 'Iron Ingot', quantity: 10 }, { itemName: 'Bolt Set (M8)', quantity: 20 }]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ itemID: 101, itemName: 'Round Table' }, { itemID: 201, itemName: 'Iron Ingot' }, { itemID: 202, itemName: 'Bolt Set (M8)' }]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ itemID: 101, itemQuantity: 5 }, { itemID: 201, itemQuantity: 142 }, { itemID: 202, itemQuantity: 520 }]) });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).fetch;
  });

  it('renders crafting page and switches between tabs', async () => {
    render(<Crafting />);

    expect(screen.getByText(/Crafting Management/i)).toBeInTheDocument();
    expect(screen.getByText(/CraftingItems stub/i)).toBeInTheDocument();

    const buttons = screen.getAllByText('Craft');
    fireEvent.click(buttons[0]);
    expect(screen.getByText(/HistoryStats stub/i)).toBeInTheDocument();
    expect(screen.getByText('Select blueprint')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Select blueprint'));
    await waitFor(() => expect(screen.getByText('Craft Panel')).toBeInTheDocument());
    expect(screen.getByText('Round Table')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Create'));
    expect(screen.getByText(/NewBlueprint stub/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel New'));
    expect(screen.getByText(/CraftingItems stub/i)).toBeInTheDocument();
  });

  it('shows the history tab when selected', () => {
    render(<Crafting />);

    fireEvent.click(screen.getByText('History'));
    expect(screen.getByText(/HistoryPanel stub/i)).toBeInTheDocument();
  });
});
