import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NewBlueprint from './newBlueprint';

describe('NewBlueprint', () => {
  const originalAlert = window.alert;

  beforeEach(() => {
    window.alert = jest.fn();
  });

  afterEach(() => {
    window.alert = originalAlert;
    jest.restoreAllMocks();
  });

  it('disables the submit button until a name is provided and allows adding/removing materials', () => {
    const onCancel = jest.fn();
    render(<NewBlueprint onCancel={onCancel} />);

    const submitButton = screen.getByRole('button', { name: /Add Blueprint/i });
    expect(submitButton).toBeDisabled();

    const blueprintNameInput = screen.getByLabelText(/Blueprint Name/i);
    fireEvent.change(blueprintNameInput, { target: { value: 'Test Blueprint' } });
    expect(submitButton).not.toBeDisabled();

    const addMaterialButton = screen.getByText(/\+ Add material to blueprint/i);
    fireEvent.click(addMaterialButton);
    expect(screen.getAllByLabelText(/Select material/i)).toHaveLength(4);

    const removeButtons = screen.getAllByLabelText(/Remove material/i);
    fireEvent.click(removeButtons[0]);
    expect(screen.getAllByLabelText(/Select material/i)).toHaveLength(3);
  });

  it('submits the form and calls cancel after successful placeholder creation', () => {
    const onCancel = jest.fn();
    render(<NewBlueprint onCancel={onCancel} />);

    fireEvent.change(screen.getByLabelText(/Blueprint Name/i), { target: { value: 'Test Blueprint' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Blueprint/i }));

    expect(window.alert).toHaveBeenCalledWith('Blueprint created! (placeholder)');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

//   it('checks backend blueprint creation endpoint for future integration', () => {
//     const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({} as any);

//     render(<NewBlueprint onCancel={jest.fn()} />);

//     expect(fetchSpy).toHaveBeenCalledWith('/api/blueprints/create');
//   });
 });
