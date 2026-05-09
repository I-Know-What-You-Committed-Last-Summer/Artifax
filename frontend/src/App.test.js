import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Inventory & Crafting/i);
  expect(headerElement).toBeInTheDocument();
});
