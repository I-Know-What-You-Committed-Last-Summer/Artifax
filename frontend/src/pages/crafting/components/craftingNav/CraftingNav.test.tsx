import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CraftingNav from './craftingNav';

describe('CraftingNav', () => {
  it('renders tabs and invokes callbacks when buttons are clicked', () => {
    const onTabChange = jest.fn();
    const onCreateBlueprint = jest.fn();

    render(
      <CraftingNav
        activeTab="craft"
        onTabChange={onTabChange}
        onCreateBlueprint={onCreateBlueprint}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Active Jobs/i }));
    fireEvent.click(screen.getByRole('button', { name: /History/i }));
    fireEvent.click(screen.getByRole('button', { name: /New Blueprint/i }));

    expect(onTabChange).toHaveBeenCalledWith('active');
    expect(onTabChange).toHaveBeenCalledWith('history');
    expect(onCreateBlueprint).toHaveBeenCalledTimes(1);
  });
});
