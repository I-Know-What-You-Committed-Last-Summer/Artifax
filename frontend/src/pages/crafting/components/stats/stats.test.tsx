import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StatsGrid from './stats';

describe('StatsGrid', () => {
  it('renders stat cards and updates transform styles on hover', () => {
    const { container } = render(<StatsGrid />);

    const firstCard = container.querySelector('.info-card');
    expect(firstCard).toBeInTheDocument();
    expect(screen.getByText(/Active Jobs/i)).toBeInTheDocument();

    if (!firstCard) {
      throw new Error('Expected info card wrapper to exist');
    }

    const cardElement = firstCard as HTMLElement;
    Object.defineProperty(cardElement, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        width: 100,
        height: 100,
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect),
    });

    fireEvent.mouseMove(cardElement, { clientX: 75, clientY: 50 });
    expect(cardElement.style.transform).toContain('scale(1.02)');

    fireEvent.mouseLeave(cardElement);
    expect(cardElement.style.transform).toBe('');
  });
});
