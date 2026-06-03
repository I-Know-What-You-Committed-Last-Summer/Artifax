import React from 'react';
import { render, screen } from '@testing-library/react';
import HistoryStats from './historyStats';

describe('HistoryStats', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders all history stat cards with labels and values', () => {
    render(<HistoryStats />);

    expect(screen.getByText(/Total Jobs/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancelled/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg Duration/i)).toBeInTheDocument();
    expect(screen.getByText(/24/i)).toBeInTheDocument();
    expect(screen.getByText(/3/i)).toBeInTheDocument();
    expect(screen.getByText(/4,821/i)).toBeInTheDocument();
    expect(screen.getByText(/6m/i)).toBeInTheDocument();
  });

//   it('checks backend stats endpoint for future integration', () => {
//     const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({} as any);

//     render(<HistoryStats />);

//     expect(fetchSpy).toHaveBeenCalledWith('/api/history/stats');
//   });
});
