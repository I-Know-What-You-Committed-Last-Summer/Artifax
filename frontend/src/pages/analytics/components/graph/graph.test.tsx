import React from 'react';
import { render, screen } from '@testing-library/react';
import GraphCard from './graph';

jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="chart-line" />,
}));

describe('GraphCard', () => {
  it('renders the analytics graph card and chart', () => {
    render(<GraphCard />);

    expect(screen.getByText(/Crafted item each month/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly craft volume by warehouse and blueprint./i)).toBeInTheDocument();
    expect(screen.getByTestId('chart-line')).toBeInTheDocument();
  });
});
