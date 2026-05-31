import React from 'react';
import { render, screen } from '@testing-library/react';
import AnalyticsPage from './analytics';

jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="chart-line" />,
}));

describe('AnalyticsPage', () => {
  it('renders analytics layout with stats, graph, and most crafted section', () => {
    render(<AnalyticsPage />);

    expect(screen.getByRole('heading', { level: 1, name: /Analytics/i })).toBeInTheDocument();
    expect(screen.getByText(/Trending:/i)).toBeInTheDocument();
    expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    expect(screen.getByText(/Most Crafted Blueprints/i)).toBeInTheDocument();
  });
});
