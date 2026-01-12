import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CrmUserEditModal from '../CrmUserEditModal';

// Mock fetch globally
global.fetch = jest.fn();

const mockUser = {
  login: {
    uuid: 'test-uuid-123',
    username: 'testuser',
    password: 'password',
  },
  name: {
    title: 'Mr',
    first: 'John',
    last: 'Doe',
  },
  gender: 'male',
  location: {
    street: {
      number: 123,
      name: 'Main St',
    },
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postcode: '10001',
  },
  email: 'john.doe@example.com',
  dob: {
    date: '1990-01-01',
    age: 34,
  },
  registered: {
    date: '2020-01-01',
    age: 4,
  },
  phone: '555-0123',
  cell: '555-0124',
  picture: {
    large: 'https://example.com/pic.jpg',
    medium: 'https://example.com/pic-med.jpg',
    thumbnail: 'https://example.com/pic-thumb.jpg',
  },
  nat: 'US',
};

describe('CrmUserEditModal', () => {
  const mockOnClose = jest.fn();
  const mockOnUserUpdated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal when open is true', () => {
    render(
      <CrmUserEditModal
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    expect(screen.getByText('Edit User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
  });

  it('does not render the modal when open is false', () => {
    render(
      <CrmUserEditModal
        open={false}
        user={mockUser}
        onClose={mockOnClose}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    expect(screen.queryByText('Edit User')).not.toBeInTheDocument();
  });

  it('displays all user information correctly', () => {
    render(
      <CrmUserEditModal
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    expect(screen.getByDisplayValue('testuser')).toBeDisabled();
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('555-0123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('555-0124')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New York')).toBeInTheDocument();
    expect(screen.getByDisplayValue('NY')).toBeInTheDocument();
    expect(screen.getByDisplayValue('USA')).toBeInTheDocument();
  });

  it('allows editing form fields', async () => {
    const user = userEvent.setup();
    render(
      <CrmUserEditModal
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    const firstNameInput = screen.getByDisplayValue('John');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');

    expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CrmUserEditModal
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('submits the form successfully', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'User updated successfully' }),
    });

    render(
      <CrmUserEditModal
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    const firstNameInput = screen.getByDisplayValue('John');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://user-api.builder-io.workers.dev/api/users/test-uuid-123',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.any(String),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('User updated successfully!')).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockOnUserUpdated).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 }
    );
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to update user' }),
    });

    render(
      <CrmUserEditModal
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to update user')).toBeInTheDocument();
    });

    expect(mockOnUserUpdated).not.toHaveBeenCalled();
  });

  it('handles network errors', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(
      <CrmUserEditModal
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    expect(mockOnUserUpdated).not.toHaveBeenCalled();
  });

  it('disables save button while submitting', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ success: true }),
              }),
            100
          )
        )
    );

    render(
      <CrmUserEditModal
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(
      <CrmUserEditModal
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    await user.clear(firstNameInput);

    const emailInput = screen.getByLabelText(/email/i);
    await user.clear(emailInput);

    // HTML5 validation should prevent submission
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    // Should not call the API if validation fails
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('displays user avatar', () => {
    render(
      <CrmUserEditModal
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', mockUser.picture.large);
  });

  it('shows username as disabled field', () => {
    render(
      <CrmUserEditModal
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    const usernameInput = screen.getByDisplayValue('testuser');
    expect(usernameInput).toBeDisabled();
    expect(screen.getByText('Username cannot be changed')).toBeInTheDocument();
  });

  it('handles all form field changes', async () => {
    const user = userEvent.setup();
    render(
      <CrmUserEditModal
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    // Test text inputs
    const emailInput = screen.getByDisplayValue('john.doe@example.com');
    await user.clear(emailInput);
    await user.type(emailInput, 'jane.doe@example.com');
    expect(screen.getByDisplayValue('jane.doe@example.com')).toBeInTheDocument();

    const phoneInput = screen.getByDisplayValue('555-0123');
    await user.clear(phoneInput);
    await user.type(phoneInput, '555-9999');
    expect(screen.getByDisplayValue('555-9999')).toBeInTheDocument();

    const cityInput = screen.getByDisplayValue('New York');
    await user.clear(cityInput);
    await user.type(cityInput, 'Los Angeles');
    expect(screen.getByDisplayValue('Los Angeles')).toBeInTheDocument();
  });

  it('submits correct payload to API', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <CrmUserEditModal
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    const firstNameInput = screen.getByDisplayValue('John');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://user-api.builder-io.workers.dev/api/users/test-uuid-123',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    const callArgs = (global.fetch as jest.Mock).mock.calls[0];
    const payload = JSON.parse(callArgs[1].body);
    
    expect(payload.name.first).toBe('Jane');
    expect(payload.email).toBe('john.doe@example.com');
    expect(payload.location.city).toBe('New York');
  });
});
