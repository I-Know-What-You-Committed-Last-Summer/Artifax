import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HistoryPanel from './historyPanel';

describe('HistoryPanel', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the history table and responds to search and tab interaction', () => {
    render(<HistoryPanel />);

    expect(screen.getByText(/Crafting History/i)).toBeInTheDocument();
    expect(screen.getByText(/22 items/i)).toBeInTheDocument();

    const searchInput = screen.getByLabelText(/Search:/i);
    fireEvent.change(searchInput, { target: { value: 'table' } });
    expect(screen.getByText(/table/i)).toBeInTheDocument();
    expect(screen.queryByText(/A4 Sketch book/i)).not.toBeInTheDocument();

    const craftedTab = screen.getByRole('button', { name: /Crafted \(\d+\)/i });
    fireEvent.click(craftedTab);
    expect(craftedTab).toHaveClass('active');
  });

//   it('checks backend history endpoint for future integration', () => {
//     const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({} as any);

//     render(<HistoryPanel />);

//     expect(fetchSpy).toHaveBeenCalledWith('/api/history');
//   });
 });
