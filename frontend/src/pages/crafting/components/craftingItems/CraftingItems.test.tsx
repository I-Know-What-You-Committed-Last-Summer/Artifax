import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CraftingItems from './craftingItems';

describe('CraftingItems', () => {
  it('renders active crafting jobs and action buttons', () => {
    render(<CraftingItems />);

    expect(screen.getByText(/Circuit Board A1/i)).toBeInTheDocument();
    expect(screen.getByText(/Gear Assembly/i)).toBeInTheDocument();
    expect(screen.getByText(/Packaging Unit/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Cancel/i })).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: /Pause/i })).toHaveLength(2);
    expect(screen.getByRole('button', { name: /Resume/i })).toBeInTheDocument();
  });

  it('updates card transform when the mouse moves and resets on leave', () => {
    render(<CraftingItems />);

    const card = screen.getByText(/Circuit Board A1/i).closest('.job-card') as HTMLElement | null;
    expect(card).toBeInTheDocument();
    expect(card?.style.transform).toBe('');

    card!.getBoundingClientRect = jest.fn(() => ({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as any));

    fireEvent.mouseMove(card!, { clientX: 60, clientY: 60 });
    expect(card?.style.transform).not.toBe('');

    fireEvent.mouseLeave(card!);
    expect(card?.style.transform).toBe('');
  });
});
