import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useApi } from '../../../../hooks/useApi';
import CraeteUsersPage from './craeteusers';

jest.mock('../../../../hooks/useApi');

const mockedUseApi = useApi as jest.MockedFunction<typeof useApi>;

const branchResponse = [{ branchID: 1, branchName: 'Main Branch' }];

function setupApiMock() {
  const api = {
    get: jest.fn().mockResolvedValue({ data: branchResponse }),
  };
  mockedUseApi.mockReturnValue(api as any);
  return api;
}

describe('CraeteUsersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it('renders the new user form and enables create when input is valid', async () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    setupApiMock();

    render(<CraeteUsersPage onSave={onSave} onDelete={onDelete} />);

    await waitFor(() => expect(useApi).toHaveBeenCalled());

    const createButton = screen.getByRole('button', { name: /Create User/i });
    expect(createButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alice Walker' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'alice.walker@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'secret12' } });

    expect(createButton).toBeEnabled();

    fireEvent.click(createButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        id: null,
        name: 'Alice Walker',
        email: 'alice.walker@example.com',
        branch: '1',
        role: 'Admin',
        status: 'Active',
        password: 'secret12',
      });
    });

    expect(window.localStorage.getItem('artifax.currentUser')).toContain('Alice Walker');
  });

  it('shows validation errors for invalid email and password', async () => {
    setupApiMock();
    render(<CraeteUsersPage onSave={jest.fn()} onDelete={jest.fn()} />);

    await waitFor(() => expect(useApi).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'bad-email' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: '123' } });

    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create User/i })).toBeDisabled();
  });

  it('shows a password-specific validation error when the email is valid', async () => {
    setupApiMock();
    render(<CraeteUsersPage onSave={jest.fn()} onDelete={jest.fn()} />);

    await waitFor(() => expect(useApi).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'good.email@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: '123' } });

    expect(screen.getByText(/Password must be at least 5 characters/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create User/i })).toBeDisabled();
  });

  it('toggles password visibility and handles existing user edit/delete', async () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    setupApiMock();

    const user = {
      id: 5,
      name: 'Existing User',
      email: 'existing@example.com',
      branch: '1',
      role: 'Employee',
      status: 'Active',
    };

    render(<CraeteUsersPage user={user} onSave={onSave} onDelete={onDelete} />);

    await waitFor(() => expect(useApi).toHaveBeenCalled());

    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    const deleteButton = screen.getByRole('button', { name: /Delete User/i });
    expect(deleteButton).toBeInTheDocument();
    expect(screen.getByDisplayValue('************')).toHaveAttribute('type', 'password');

    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith(5);

    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
    fireEvent.click(screen.getByRole('button', { name: /Show password/i }));
    expect(screen.getByDisplayValue('************')).toHaveAttribute('type', 'text');
  });
});
