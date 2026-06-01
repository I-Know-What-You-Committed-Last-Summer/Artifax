import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CraftingQueue from './craftingQueue';

describe('CraftingQueue', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders queue summary and disables pagination when only one page exists', () => {
    render(<CraftingQueue />);

    expect(screen.getByText(/3 \/ 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Crafting Queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Up Next/i)).toBeInTheDocument();
    expect(screen.getByText(/Page 1 \/ 1/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Prev/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
  });

//   it('checks backend queue endpoint for future integration', () => {
//     const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({} as any);

//     render(<CraftingQueue />);

//     expect(fetchSpy).toHaveBeenCalledWith('/api/crafting-queue');
//   });
 });
