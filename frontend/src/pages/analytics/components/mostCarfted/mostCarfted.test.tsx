import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MostCrafted from './mostCarfted';

describe('MostCrafted', () => {
  it('renders the most crafted blueprint list and sorts low to high', () => {
    render(<MostCrafted />);

    const headingCards = screen.getAllByRole('heading', { level: 4 });
    expect(headingCards[0]).toHaveTextContent('Round Table');

    const selectToggle = screen.getByRole('button', { name: /Most crafted sort order/i });
    fireEvent.click(selectToggle);
    fireEvent.click(screen.getByRole('option', { name: /Low to high/i }));

    const updatedHeadingCards = screen.getAllByRole('heading', { level: 4 });
    expect(updatedHeadingCards[0]).toHaveTextContent('Hammer');
  });
});
